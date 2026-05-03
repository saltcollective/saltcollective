import { prisma } from '@saltcollective/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const clubs = await prisma.club.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      createdAt: true,
      _count: { select: { memberships: true, businesses: true } },
    },
  });

  return { clubs };
};
