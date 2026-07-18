import { prisma } from '@saltcollective/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const twelveWeeksAgo = new Date(Date.now() - 84 * 24 * 60 * 60 * 1000);

  const [totalClubs, activeClubs, totalSponsors, clicks30d, allRecentEvents, clicksByClub] =
    await Promise.all([
      prisma.club.count(),
      prisma.club.count({ where: { status: 'ACTIVE' } }),
      prisma.business.count(),
      prisma.clickEvent.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.clickEvent.findMany({
        where: { createdAt: { gte: twelveWeeksAgo } },
        select: { createdAt: true, clubId: true },
      }),
      prisma.clickEvent.groupBy({
        by: ['clubId'],
        where: { createdAt: { gte: thirtyDaysAgo } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 7,
      }),
    ]);

  // Resolve club names for top-clubs list
  const clubIds = clicksByClub.map((c) => c.clubId);
  const clubs = clubIds.length
    ? await prisma.club.findMany({
        where: { id: { in: clubIds } },
        select: { id: true, name: true, slug: true },
      })
    : [];

  const topClubs = clicksByClub.map((c) => ({
    clubId: c.clubId,
    clubName: clubs.find((cl) => cl.id === c.clubId)?.name ?? 'Unknown',
    clubSlug: clubs.find((cl) => cl.id === c.clubId)?.slug ?? null,
    clicks: c._count.id,
  }));

  // Weekly click totals — 12 weeks
  const now = Date.now();
  const weeklyClicks = Array.from({ length: 12 }, (_, w) => {
    const start = new Date(now - (12 - w) * 7 * 24 * 60 * 60 * 1000);
    const end = new Date(now - (11 - w) * 7 * 24 * 60 * 60 * 1000);
    return allRecentEvents.filter(
      (e) => e.createdAt >= start && e.createdAt < end,
    ).length;
  });

  // Weekday heatmap — 8 rows (weeks) × 7 cols (Mon–Sun)
  const eightWeeksAgo = new Date(now - 56 * 24 * 60 * 60 * 1000);
  const recentEvents = allRecentEvents.filter((e) => e.createdAt >= eightWeeksAgo);
  const heatmap: number[][] = Array.from({ length: 8 }, () => Array(7).fill(0));
  for (const e of recentEvents) {
    const msAgo = now - new Date(e.createdAt).getTime();
    const week = Math.floor(msAgo / (7 * 24 * 60 * 60 * 1000));
    const day = (new Date(e.createdAt).getDay() + 6) % 7; // 0=Mon, 6=Sun
    if (week < 8) heatmap[7 - week][day]++;
  }

  return {
    stats: { totalClubs, activeClubs, totalSponsors, clicks30d },
    topClubs,
    weeklyClicks,
    heatmap,
  };
};
