import { redirect } from '@sveltejs/kit';
import { prisma } from '@saltcollective/schema';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
  if (!locals.user) redirect(302, '/sign-in');
  if (!locals.user.isActive) redirect(302, '/account-deactivated');

  // Users with a live club normally get bounced to the dashboard — except when
  // explicitly creating another club (?new=1) or mid-flow on one (?club=...).
  if (url.searchParams.has('new') || url.searchParams.has('club')) return {};

  const membership = await prisma.clubMembership.findFirst({
    where: { userId: locals.user.id },
    select: { club: { select: { publishedAt: true } } },
  });

  if (membership?.club.publishedAt) redirect(302, '/dashboard');

  return {};
};
