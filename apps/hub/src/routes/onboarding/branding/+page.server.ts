import { redirect } from '@sveltejs/kit';
import { prisma } from '@saltcollective/schema';
import type { PageServerLoad, Actions } from './$types';

async function getClub(userId: string, clubId: string | null) {
  if (!clubId) redirect(302, '/onboarding/club');
  const membership = await prisma.clubMembership.findFirst({
    where: { userId, clubId, role: 'ADMIN' },
    select: {
      club: {
        select: { id: true, logoUrl: true, primaryColour: true, secondaryColour: true },
      },
    },
  });
  if (!membership) redirect(302, '/onboarding/club');
  return membership.club;
}

export const load: PageServerLoad = async ({ locals, url }) => {
  if (!locals.user) redirect(302, '/sign-in');
  const club = await getClub(locals.user.id, url.searchParams.get('club'));
  return { club };
};

export const actions: Actions = {
  update: async ({ request, locals }) => {
    if (!locals.user) redirect(302, '/sign-in');

    const data = await request.formData();
    const club = await getClub(locals.user.id, data.get('clubId') as string);

    const logoUrl = (data.get('logoUrl') as string)?.trim() || null;
    const primaryColour = (data.get('primaryColour') as string)?.trim() || null;
    const secondaryColour = (data.get('secondaryColour') as string)?.trim() || null;

    await prisma.club.update({
      where: { id: club.id },
      data: { logoUrl, primaryColour, secondaryColour },
    });

    redirect(302, `/onboarding/tiers?club=${club.id}`);
  },
};
