import { redirect } from '@sveltejs/kit';
import { prisma } from '@saltcollective/schema';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  if (!locals.user) redirect(302, '/sign-in');
  if (!locals.user.isActive) redirect(302, '/account-deactivated');

  const membership = await prisma.clubMembership.findFirst({
    where: { userId: locals.user.id },
    select: { club: { select: { publishedAt: true } } },
  });

  if (membership?.club.publishedAt) redirect(302, '/dashboard');

  return {};
};
