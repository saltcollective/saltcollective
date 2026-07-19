import { redirect } from '@sveltejs/kit';
import { prisma } from '@saltcollective/schema';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  if (!locals.user) redirect(302, '/sign-in');
  if (!locals.user.isActive) redirect(302, '/account-deactivated');

  const membership = await prisma.clubMembership.findFirst({
    where: { userId: locals.user.id },
    select: {
      role: true,
      club: {
        select: { id: true, name: true, slug: true, logoUrl: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  if (!membership) redirect(302, '/onboarding/club');

  return { club: membership.club, role: membership.role };
};
