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

  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);
  twelveMonthsAgo.setHours(0, 0, 0, 0);

  const [businesses, clicks, rawEvents] = await Promise.all([
    prisma.business.findMany({
      where: { clubId: club.id, status: { in: ['ACTIVE', 'ARCHIVED'] } },
      orderBy: [{ sponsorTier: { order: 'asc' } }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        logoUrl: true,
        status: true,
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
    prisma.clickEvent.findMany({
      where: {
        clubId: club.id,
        createdAt: { gte: since ?? twelveMonthsAgo },
      },
      select: { createdAt: true },
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
  const totalWebsite = rows.reduce((s, r) => s + r.clicks.WEBSITE, 0);
  const totalEmail = rows.reduce((s, r) => s + r.clicks.EMAIL, 0);
  const totalPhone = rows.reduce((s, r) => s + r.clicks.PHONE, 0);

  const useMonthly = period === 'all';
  const buckets = new Map<string, number>();

  if (!useMonthly) {
    const days = PERIODS[period as keyof typeof PERIODS];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      buckets.set(d.toISOString().slice(0, 10), 0);
    }
  } else {
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      buckets.set(d.toISOString().slice(0, 7), 0);
    }
  }

  for (const e of rawEvents) {
    const key = useMonthly
      ? new Date(e.createdAt).toISOString().slice(0, 7)
      : new Date(e.createdAt).toISOString().slice(0, 10);
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }

  const chart = [...buckets.entries()].map(([date, total]) => ({ date, total }));

  return { period, rows, totalClicks, totalWebsite, totalEmail, totalPhone, chart };
};
