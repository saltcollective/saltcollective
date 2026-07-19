import { sequence } from '@sveltejs/kit/hooks';
import { withClerkHandler, clerkClient } from 'svelte-clerk/server';
import { prisma } from '@saltcollective/schema';
import { logAudit } from '$lib/server/audit';

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

export const handle = sequence(
  withClerkHandler(),
  async ({ event, resolve }) => {
    const { userId } = event.locals.auth();
    if (userId) {
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
      } else if (
        !user.lastActiveAt ||
        Date.now() - user.lastActiveAt.getTime() > LAST_ACTIVE_THROTTLE_MS
      ) {
        await prisma.user.update({
          where: { id: user.id },
          data: { lastActiveAt: new Date() },
        });
      }

      event.locals.user = user;
    }
    return resolve(event);
  }
);
