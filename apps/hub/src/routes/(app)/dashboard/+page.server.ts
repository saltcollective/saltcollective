import { prisma } from '@saltcollective/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
  const { club } = await parent();

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [active, archived, leads, viewsThisMonth, recent] = await Promise.all([
    prisma.business.count({ where: { clubId: club.id, status: 'ACTIVE' } }),
    prisma.business.count({ where: { clubId: club.id, status: 'ARCHIVED' } }),
    prisma.business.count({ where: { clubId: club.id, status: 'LEAD' } }),
    prisma.clickEvent.count({
      where: { clubId: club.id, createdAt: { gte: monthStart } },
    }),
    prisma.business.findMany({
      where: { clubId: club.id, status: { in: ['ACTIVE', 'ARCHIVED'] } },
      take: 4,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        status: true,
        logoUrl: true,
        sponsorTier: { select: { name: true } },
      },
    }),
  ]);

  return {
    stats: { total: active + archived, active, inactive: archived, leads, viewsThisMonth },
    recent,
  };
};
