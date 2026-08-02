import type { Handle, HandleServerError } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { withClerkHandler, clerkClient } from 'svelte-clerk/server';
import { trace } from '@opentelemetry/api';
import { prisma } from '@saltcollective/schema';
import { logAudit } from '$lib/server/audit';
import { tracer, withSpan, SpanKind, SpanStatusCode } from '$lib/server/telemetry';

const USER_SELECT = {
  id: true,
  username: true,
  email: true,
  userType: true,
  isActive: true,
  lastActiveAt: true,
} as const;

// One lastActiveAt write per user per hour at most.
const LAST_ACTIVE_THROTTLE_MS = 60 * 60 * 1000;

// Outermost handler: one SERVER span per request. Deno's built-in OTel does
// not instrument node:http (our adapter-node path), so this span is what ties
// the auto-captured fetch spans (Accelerate, Clerk, Resend) to a request.
// User attrs are set in `finally` — locals.user exists by then.
const telemetryHandle: Handle = ({ event, resolve }) => {
  const routeId = event.route.id ?? event.url.pathname;
  return tracer.startActiveSpan(
    `${event.request.method} ${routeId}`,
    {
      kind: SpanKind.SERVER,
      attributes: {
        'http.request.method': event.request.method,
        'http.route': routeId,
        'url.path': event.url.pathname,
      },
    },
    async (span) => {
      event.locals.requestSpan = span;
      try {
        const response = await resolve(event);
        span.setAttribute('http.response.status_code', response.status);
        if (response.status >= 500) span.setStatus({ code: SpanStatusCode.ERROR });
        return response;
      } catch (err) {
        span.recordException(err instanceof Error ? err : new Error(String(err)));
        span.setStatus({ code: SpanStatusCode.ERROR });
        throw err;
      } finally {
        const user = event.locals.user;
        if (user) {
          span.setAttribute('app.user.id', user.id);
          span.setAttribute('app.user.type', user.userType);
        }
        span.end();
      }
    },
  );
};

const userHandle: Handle = async ({ event, resolve }) => {
  const { userId } = event.locals.auth();
  if (userId) {
    await withSpan('auth.resolveUser', { 'app.clerk.id': userId }, async (span) => {
      let user = await prisma.user.findUnique({
        where: { clerkId: userId },
        select: USER_SELECT,
      });

      if (!user) {
        const clerkUser = await clerkClient.users.getUser(userId);
        user = await prisma.user.create({
          data: {
            clerkId: userId,
            username: clerkUser.username ?? null,
            email: clerkUser.emailAddresses[0]?.emailAddress ?? '',
            lastActiveAt: new Date(),
          },
          select: USER_SELECT,
        });
        await logAudit({
          entityType: 'USER',
          entityId: user.id,
          entityName: user.email,
          type: 'USER_CREATED',
        });
        span.setAttribute('app.user.created', true);
      } else if (
        !user.lastActiveAt ||
        Date.now() - user.lastActiveAt.getTime() > LAST_ACTIVE_THROTTLE_MS
      ) {
        await prisma.user.update({
          where: { id: user.id },
          data: { lastActiveAt: new Date() },
        });
        span.setAttribute('app.user.lastActiveUpdated', true);
      }

      event.locals.user = user;
    });
  }
  return resolve(event);
};

export const handle = sequence(telemetryHandle, withClerkHandler(), userHandle);

// Load/action errors are caught by SvelteKit before telemetryHandle's catch
// sees them — record them on the request span here instead.
export const handleError: HandleServerError = ({ error, event, status, message }) => {
  const span = trace.getActiveSpan() ?? event.locals.requestSpan;
  if (span && status >= 500) {
    span.recordException(error instanceof Error ? error : new Error(String(error)));
    span.setStatus({ code: SpanStatusCode.ERROR, message });
  }
};
