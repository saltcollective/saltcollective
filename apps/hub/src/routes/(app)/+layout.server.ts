import { redirect } from '@sveltejs/kit';
import { prisma } from '@saltcollective/schema';
import { getClubAccess } from '$lib/server/club-access';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, cookies }) => {
  if (!locals.user) redirect(302, '/sign-in');
  if (!locals.user.isActive) redirect(302, '/account-deactivated');

  const access = await getClubAccess(locals, cookies);
  if (!access) redirect(302, '/onboarding/club');

  const memberships = await prisma.clubMembership.findMany({
    where: { userId: locals.user.id },
    orderBy: { createdAt: 'asc' },
    select: { club: { select: { id: true, name: true } } },
  });

  return {
    club: access.club,
    role: access.role,
    impersonating: access.impersonating,
    clubs: memberships.map((m) => m.club),
  };
};
