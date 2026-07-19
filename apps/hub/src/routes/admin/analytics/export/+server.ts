import { error } from '@sveltejs/kit';
import { prisma } from '@saltcollective/schema';
import { toCsv } from '$lib/server/csv';
import type { RequestHandler } from './$types';

// Layout guards don't run for +server endpoints — this must enforce SITE_ADMIN itself.
export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) error(401, 'Sign in required');
  if (locals.user.userType !== 'SITE_ADMIN') error(403, 'Access denied');

  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const events = await prisma.clickEvent.findMany({
    where: { createdAt: { gte: ninetyDaysAgo } },
    orderBy: { createdAt: 'desc' },
    select: {
      createdAt: true,
      type: true,
      club: { select: { name: true, slug: true } },
      business: { select: { name: true } },
    },
  });

  const csv = toCsv(
    ['timestamp', 'club', 'club_slug', 'business', 'click_type'],
    events.map((e) => [e.createdAt.toISOString(), e.club.name, e.club.slug, e.business.name, e.type]),
  );

  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="saltcollective-clicks-${stamp}.csv"`,
    },
  });
};
