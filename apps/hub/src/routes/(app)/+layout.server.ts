import { redirect } from '@sveltejs/kit';
import { prisma } from '@saltcollective/schema';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  if (!locals.user) redirect(302, '/sign-in');

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

  // No club yet — send back to marketing until onboarding exists
  if (!membership) redirect(302, '/');

  return { club: membership.club, role: membership.role };
};
