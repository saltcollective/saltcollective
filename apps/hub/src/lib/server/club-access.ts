import type { Cookies } from '@sveltejs/kit';
import { prisma } from '@saltcollective/schema';
import { withSpan, type Span } from '$lib/server/telemetry';

export const IMPERSONATION_COOKIE = 'impersonation_session';
export const ACTIVE_CLUB_COOKIE = 'active_club';

export interface ClubAccess {
  club: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    status: 'ACTIVE' | 'SUSPENDED';
    publishedAt: Date | null;
  };
  role: 'ADMIN' | 'EDITOR';
  impersonating: boolean;
}

const CLUB_SELECT = {
  id: true,
  name: true,
  slug: true,
  logoUrl: true,
  status: true,
  publishedAt: true,
} as const;

// Central club resolution for the (app) dashboard: an active impersonation
// session (SITE_ADMIN only) wins, otherwise the user's own membership.
// Multi-club support will extend this with an "active club" selection.
export async function getClubAccess(
  locals: App.Locals,
  cookies: Cookies,
): Promise<ClubAccess | null> {
  if (!locals.user) return null;

  return withSpan('clubAccess.resolve', { 'app.user.id': locals.user.id }, async (span) => {
    const access = await resolveClubAccess(locals, cookies, span);
    span.setAttribute('app.club.source', access?.source ?? 'none');
    if (access) {
      span.setAttribute('app.club.id', access.club.id);
      span.setAttribute('app.club.slug', access.club.slug);
      span.setAttribute('app.club.role', access.role);
      span.setAttribute('app.impersonating', access.impersonating);
      locals.requestSpan?.setAttribute('app.club.id', access.club.id);
      locals.requestSpan?.setAttribute('app.impersonating', access.impersonating);
    }
    return access && { club: access.club, role: access.role, impersonating: access.impersonating };
  });
}

async function resolveClubAccess(
  locals: App.Locals,
  cookies: Cookies,
  span: Span,
): Promise<(ClubAccess & { source: string }) | null> {
  if (!locals.user) return null;

  const sessionId = cookies.get(IMPERSONATION_COOKIE);
  if (sessionId && locals.user.userType === 'SITE_ADMIN') {
    const session = await prisma.impersonationLog.findFirst({
      where: { id: sessionId, impersonatorId: locals.user.id, endedAt: null },
      select: { id: true, clubId: true },
    });
    if (session) {
      const club = await prisma.club.findUnique({
        where: { id: session.clubId },
        select: CLUB_SELECT,
      });
      if (club) {
        return { club, role: 'ADMIN', impersonating: true, source: 'impersonation' };
      }
      // Club was deleted mid-session — close the session and fall through.
      await prisma.impersonationLog.update({
        where: { id: session.id },
        data: { endedAt: new Date() },
      });
      cookies.delete(IMPERSONATION_COOKIE, { path: '/' });
      span.addEvent('impersonation.staleSessionClosed');
    }
  }

  // Selected active club (multi-club). A stale cookie — membership revoked or
  // club deleted — silently falls through to the default.
  const activeClubId = cookies.get(ACTIVE_CLUB_COOKIE);
  if (activeClubId) {
    const selected = await prisma.clubMembership.findFirst({
      where: { userId: locals.user.id, clubId: activeClubId },
      select: {
        role: true,
        club: { select: CLUB_SELECT },
      },
    });
    if (selected) {
      return { club: selected.club, role: selected.role, impersonating: false, source: 'activeCookie' };
    }
  }

  const membership = await prisma.clubMembership.findFirst({
    where: { userId: locals.user.id },
    orderBy: { createdAt: 'asc' },
    select: {
      role: true,
      club: { select: CLUB_SELECT },
    },
  });
  if (!membership) return null;

  return { club: membership.club, role: membership.role, impersonating: false, source: 'firstMembership' };
}
