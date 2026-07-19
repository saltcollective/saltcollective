import { error } from '@sveltejs/kit';
import { prisma } from '@saltcollective/schema';
import { toCsv } from '$lib/server/csv';
import { getClubAccess } from '$lib/server/club-access';
import type { RequestHandler } from './$types';

const PERIOD_DAYS: Record<string, number> = { '30d': 30, '90d': 90 };

// Layout guards don't run for +server endpoints — this must resolve club access itself.
export const GET: RequestHandler = async ({ locals, url, cookies }) => {
  if (!locals.user) error(401, 'Sign in required');

  const access = await getClubAccess(locals, cookies);
  if (!access) error(403, 'Access denied');

  const period = url.searchParams.get('period') ?? 'all';
  const where: { clubId: string; createdAt?: { gte: Date } } = { clubId: access.club.id };
  if (period in PERIOD_DAYS) {
    const since = new Date();
    since.setDate(since.getDate() - PERIOD_DAYS[period]);
    where.createdAt = { gte: since };
  }

  const events = await prisma.clickEvent.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: {
      createdAt: true,
      type: true,
      business: { select: { name: true } },
    },
  });

  const csv = toCsv(
    ['timestamp', 'business', 'click_type'],
    events.map((e) => [e.createdAt.toISOString(), e.business.name, e.type]),
  );

  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${access.club.slug}-clicks-${stamp}.csv"`,
    },
  });
};
