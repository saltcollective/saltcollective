import { prisma } from '@saltcollective/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const [totalClubs, activeClubs, totalSponsors, totalUsers, recentClubs, recentActivity] =
    await Promise.all([
      prisma.club.count(),
      prisma.club.count({ where: { status: 'ACTIVE' } }),
      prisma.business.count(),
      prisma.user.count(),
      prisma.club.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
          createdAt: true,
          _count: { select: { memberships: true, businesses: true } },
        },
      }),
      prisma.auditEvent.findMany({
        take: 15,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          type: true,
          entityName: true,
          actorEmail: true,
          detail: true,
          createdAt: true,
        },
      }),
    ]);

  return {
    stats: { totalClubs, activeClubs, totalSponsors, totalUsers },
    recentClubs,
    recentActivity,
  };
};
