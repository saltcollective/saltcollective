import { prisma } from '@saltcollective/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      username: true,
      userType: true,
      isActive: true,
      createdAt: true,
      memberships: {
        select: {
          role: true,
          club: { select: { name: true } },
        },
      },
    },
  });

  return { users };
};
