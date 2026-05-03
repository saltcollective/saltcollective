import { redirect, fail } from '@sveltejs/kit';
import { prisma } from '@saltcollective/schema';
import type { PageServerLoad, Actions } from './$types';

async function getClub(userId: string, clubId: string | null) {
  if (!clubId) redirect(302, '/onboarding/club');
  const membership = await prisma.clubMembership.findFirst({
    where: { userId, clubId, role: 'ADMIN' },
    select: {
      club: {
        select: {
          id: true,
          sponsorTiers: {
            select: { name: true, price: true, order: true },
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  });
  if (!membership) redirect(302, '/onboarding/club');
  return membership.club;
}

export const load: PageServerLoad = async ({ locals, url }) => {
  if (!locals.user) redirect(302, '/sign-in');
  const club = await getClub(locals.user.id, url.searchParams.get('club'));
  return {
    clubId: club.id,
    existingTiers: club.sponsorTiers.map((t) => ({
      name: t.name,
      price: t.price?.toString() ?? '',
    })),
  };
};

export const actions: Actions = {
  save: async ({ request, locals }) => {
    if (!locals.user) redirect(302, '/sign-in');

    const data = await request.formData();
    const club = await getClub(locals.user.id, data.get('clubId') as string);

    let tiers: { name: string; price: string }[];
    try {
      tiers = JSON.parse(data.get('tiers') as string);
    } catch {
      return fail(400, { error: 'Invalid tier data' });
    }

    const validTiers = tiers.filter((t) => t.name.trim());

    await prisma.sponsorTier.deleteMany({ where: { clubId: club.id } });

    if (validTiers.length > 0) {
      await prisma.sponsorTier.createMany({
        data: validTiers.map((t, i) => ({
          clubId: club.id,
          name: t.name.trim(),
          order: i,
          price: t.price?.trim() ? parseFloat(t.price) : null,
        })),
      });
    }

    redirect(302, `/onboarding/payment?club=${club.id}`);
  },
};
