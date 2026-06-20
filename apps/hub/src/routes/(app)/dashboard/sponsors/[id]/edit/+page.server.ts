import { redirect, fail, error } from '@sveltejs/kit';
import { prisma } from '@saltcollective/schema';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ parent, params }) => {
  const { club } = await parent();

  const [business, tiers] = await Promise.all([
    prisma.business.findFirst({
      where: { id: params.id, clubId: club.id },
      select: {
        id: true, name: true, description: true, email: true, phone: true,
        websiteUrl: true, logoUrl: true, status: true, sponsorTierId: true,
      },
    }),
    prisma.sponsorTier.findMany({
      where: { clubId: club.id },
      orderBy: { order: 'asc' },
      select: { id: true, name: true },
    }),
  ]);

  if (!business) error(404, 'Sponsor not found');

  return { business, tiers };
};

export const actions: Actions = {
  update: async ({ request, locals, params }) => {
    if (!locals.user) redirect(302, '/sign-in');

    const membership = await prisma.clubMembership.findFirst({
      where: { userId: locals.user.id },
      select: { club: { select: { id: true } } },
    });
    if (!membership) redirect(302, '/onboarding/club');

    const clubId = membership.club.id;

    const business = await prisma.business.findFirst({
      where: { id: params.id, clubId },
      select: { id: true },
    });
    if (!business) error(404, 'Sponsor not found');

    const fd = await request.formData();
    const name = (fd.get('name') as string)?.trim();
    const description = (fd.get('description') as string)?.trim();
    const sponsorTierId = (fd.get('sponsorTierId') as string)?.trim();
    const email = (fd.get('email') as string)?.trim() || null;
    const phone = (fd.get('phone') as string)?.trim() || null;
    const websiteUrl = (fd.get('websiteUrl') as string)?.trim() || null;
    const logoUrl = (fd.get('logoUrl') as string)?.trim() || null;
    const isActive = fd.get('isActive') === 'true';

    const base = { name, description, sponsorTierId, email, phone, websiteUrl };

    if (!name) return fail(400, { error: 'Name is required', ...base });
    if (!description) return fail(400, { error: 'Description is required', ...base });
    if (!sponsorTierId) return fail(400, { error: 'Please select a tier', ...base });

    const tier = await prisma.sponsorTier.findFirst({
      where: { id: sponsorTierId, clubId },
      select: { id: true },
    });
    if (!tier) return fail(400, { error: 'Invalid tier', ...base });

    if (websiteUrl) {
      try { new URL(websiteUrl); } catch {
        return fail(400, { error: 'Website URL is not valid', ...base });
      }
    }

    await prisma.business.update({
      where: { id: params.id },
      data: {
        name,
        description,
        sponsorTierId,
        email,
        phone,
        websiteUrl,
        logoUrl,
        status: isActive ? 'ACTIVE' : 'ARCHIVED',
      },
    });

    redirect(302, '/dashboard/sponsors');
  },

  delete: async ({ locals, params }) => {
    if (!locals.user) redirect(302, '/sign-in');

    const membership = await prisma.clubMembership.findFirst({
      where: { userId: locals.user.id },
      select: { club: { select: { id: true } } },
    });
    if (!membership) redirect(302, '/onboarding/club');

    const business = await prisma.business.findFirst({
      where: { id: params.id, clubId: membership.club.id },
      select: { id: true },
    });
    if (!business) error(404, 'Sponsor not found');

    await prisma.business.delete({ where: { id: params.id } });
    redirect(302, '/dashboard/sponsors');
  },
};
