import { prisma } from '@saltcollective/schema';
import type { PageServerLoad } from './$types';

const PERIODS = { '30d': 30, '90d': 90 } as const;
type Period = keyof typeof PERIODS | 'all';

export const load: PageServerLoad = async ({ parent, url }) => {
  const { club } = await parent();

  const rawPeriod = url.searchParams.get('period') ?? 'all';
  const period: Period = rawPeriod in PERIODS ? (rawPeriod as Period) : 'all';

  let since: Date | undefined;
  if (period !== 'all') {
    since = new Date();
    since.setDate(since.getDate() - PERIODS[period]);
    since.setHours(0, 0, 0, 0);
  }

  const [businesses, clicks] = await Promise.all([
    prisma.business.findMany({
      where: { clubId: club.id },
      orderBy: [{ sponsorTier: { order: 'asc' } }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        logoUrl: true,
        isActive: true,
        sponsorTier: { select: { name: true } },
      },
    }),
    prisma.clickEvent.groupBy({
      by: ['businessId', 'type'],
      where: {
        clubId: club.id,
        ...(since ? { createdAt: { gte: since } } : {}),
      },
      _count: { id: true },
    }),
  ]);

  const clickMap: Record<string, { EMAIL: number; WEBSITE: number; PHONE: number }> = {};
  for (const row of clicks) {
    if (!clickMap[row.businessId]) {
      clickMap[row.businessId] = { EMAIL: 0, WEBSITE: 0, PHONE: 0 };
    }
    clickMap[row.businessId][row.type] = row._count.id;
  }

  const rows = businesses.map((b) => {
    const c = clickMap[b.id] ?? { EMAIL: 0, WEBSITE: 0, PHONE: 0 };
    return { ...b, clicks: { ...c, total: c.EMAIL + c.WEBSITE + c.PHONE } };
  });

  const totalClicks = rows.reduce((sum, r) => sum + r.clicks.total, 0);

  return { period, rows, totalClicks };
};
