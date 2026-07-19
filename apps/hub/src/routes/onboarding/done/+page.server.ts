import { redirect } from '@sveltejs/kit';
import { prisma } from '@saltcollective/schema';
import { logAudit } from '$lib/server/audit';
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

  return { clubName: club.name, slug: club.slug };
};
