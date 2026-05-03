import { redirect } from '@sveltejs/kit';
import { prisma } from '@saltcollective/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
  if (!locals.user) redirect(302, '/sign-in');

  const clubId = url.searchParams.get('club');
  if (!clubId) redirect(302, '/onboarding/club');

  const membership = await prisma.clubMembership.findFirst({
    where: { userId: locals.user.id, clubId, role: 'ADMIN' },
    select: { clubId: true },
  });
  if (!membership) redirect(302, '/onboarding/club');

  return { clubId };
};
