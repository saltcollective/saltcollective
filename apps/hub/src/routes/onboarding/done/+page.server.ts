import { redirect } from '@sveltejs/kit';
import { prisma } from '@saltcollective/schema';
import { publishClub } from '$lib/server/admin-clubs';
import { ACTIVE_CLUB_COOKIE } from '$lib/server/club-access';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url, cookies }) => {
  if (!locals.user) redirect(302, '/sign-in');

  const clubId = url.searchParams.get('club');
  if (!clubId) redirect(302, '/onboarding/club');

  const membership = await prisma.clubMembership.findFirst({
    where: { userId: locals.user.id, clubId, role: 'ADMIN' },
    select: { clubId: true },
  });
  if (!membership) redirect(302, '/onboarding/club');

  await publishClub(clubId, { id: locals.user.id, email: locals.user.email });

  const club = await prisma.club.findUniqueOrThrow({
    where: { id: clubId },
    select: { name: true, slug: true },
  });

  // Land the user in the club they just finished onboarding.
  cookies.set(ACTIVE_CLUB_COOKIE, clubId, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
  });

  return { clubName: club.name, slug: club.slug };
};
