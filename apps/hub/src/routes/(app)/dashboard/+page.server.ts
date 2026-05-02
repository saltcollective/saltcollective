import { prisma } from '@saltcollective/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
  const { club } = await parent();

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [total, active, viewsThisMonth, recent] = await Promise.all([
    prisma.business.count({ where: { clubId: club.id } }),
    prisma.business.count({ where: { clubId: club.id, isActive: true } }),
    prisma.clickEvent.count({
      where: { clubId: club.id, createdAt: { gte: monthStart } },
    }),
    prisma.business.findMany({
      where: { clubId: club.id },
      take: 4,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        isActive: true,
        logoUrl: true,
        sponsorTier: { select: { name: true } },
      },
    }),
  ]);

  return {
    stats: { total, active, inactive: total - active, viewsThisMonth },
    recent,
  };
};
