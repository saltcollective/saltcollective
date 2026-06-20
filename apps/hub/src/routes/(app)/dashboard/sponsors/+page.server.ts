import { redirect, fail, error } from '@sveltejs/kit';
import { prisma } from '@saltcollective/schema';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
  const { club } = await parent();

  const [businesses, tiers] = await Promise.all([
    prisma.business.findMany({
      where: { clubId: club.id },
      orderBy: [{ status: 'asc' }, { sponsorTier: { order: 'asc' } }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        status: true,
        email: true,
        phone: true,
        websiteUrl: true,
        logoUrl: true,
        contactName: true,
        desiredSpend: true,
        message: true,
        createdAt: true,
        sponsorTier: { select: { id: true, name: true } },
      },
    }),
    prisma.sponsorTier.findMany({
      where: { clubId: club.id },
      orderBy: { order: 'asc' },
      select: { id: true, name: true },
    }),
  ]);

  // Decimal isn't serialisable across the load boundary — convert to number.
  return {
    businesses: businesses.map((b) => ({
      ...b,
      desiredSpend: b.desiredSpend ? Number(b.desiredSpend) : null,
    })),
    tiers,
  };
};

async function requireAdminClubId(userId: string | undefined): Promise<string> {
  if (!userId) redirect(302, '/sign-in');
  const membership = await prisma.clubMembership.findFirst({
    where: { userId, role: 'ADMIN' },
    select: { club: { select: { id: true } } },
  });
  if (!membership) redirect(302, '/onboarding/club');
  return membership.club.id;
}

export const actions: Actions = {
  // Publish a lead: requires it to have a tier assigned first.
  publish: async ({ request, locals }) => {
    const clubId = await requireAdminClubId(locals.user?.id);
    const fd = await request.formData();
    const id = fd.get('id') as string;

    const business = await prisma.business.findFirst({
      where: { id, clubId },
      select: { id: true, sponsorTierId: true, description: true },
    });
    if (!business) error(404, 'Sponsor not found');
    if (!business.sponsorTierId || !business.description) {
      return fail(400, {
        error: 'Assign a tier and description before publishing — edit the lead first.',
      });
    }

    await prisma.business.update({ where: { id }, data: { status: 'ACTIVE' } });
    return { success: true };
  },

  // Decline a lead.
  decline: async ({ request, locals }) => {
    const clubId = await requireAdminClubId(locals.user?.id);
    const fd = await request.formData();
    const id = fd.get('id') as string;

    const business = await prisma.business.findFirst({
      where: { id, clubId },
      select: { id: true },
    });
    if (!business) error(404, 'Sponsor not found');

    await prisma.business.update({ where: { id }, data: { status: 'DECLINED' } });
    return { success: true };
  },
};
