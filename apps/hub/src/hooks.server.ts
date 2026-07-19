import { sequence } from '@sveltejs/kit/hooks';
import { withClerkHandler, clerkClient } from 'svelte-clerk/server';
import { prisma } from '@saltcollective/schema';

export const handle = sequence(
  withClerkHandler(),
  async ({ event, resolve }) => {
    const { userId } = event.locals.auth();
    if (userId) {
      let user = await prisma.user.findUnique({
        where: { clerkId: userId },
        select: { id: true, username: true, email: true, userType: true, isActive: true },
      });

      if (!user) {
        const clerkUser = await clerkClient.users.getUser(userId);
        user = await prisma.user.create({
          data: {
            clerkId: userId,
            username: clerkUser.username ?? null,
            email: clerkUser.emailAddresses[0]?.emailAddress ?? '',
          },
          select: { id: true, username: true, email: true, userType: true, isActive: true },
        });
      }

      event.locals.user = user;
    }
    return resolve(event);
  }
);
