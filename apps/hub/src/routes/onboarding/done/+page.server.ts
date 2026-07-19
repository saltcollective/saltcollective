import { redirect } from '@sveltejs/kit';
import { prisma } from '@saltcollective/schema';
import { logAudit } from '$lib/server/audit';
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

  const published = await prisma.club.updateMany({
    where: { id: clubId, publishedAt: null },
    data: { publishedAt: new Date() },
  });

  const club = await prisma.club.findUniqueOrThrow({
    where: { id: clubId },
    select: { name: true, slug: true },
  });

  if (published.count > 0) {
    await logAudit({
      entityType: 'CLUB',
      entityId: clubId,
      entityName: club.name,
      type: 'CLUB_PUBLISHED',
      actor: { id: locals.user.id, email: locals.user.email },
    });
  }

  // Land the user in the club they just finished onboarding.
  cookies.set(ACTIVE_CLUB_COOKIE, clubId, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
  });

  return { clubName: club.name, slug: club.slug };
};
