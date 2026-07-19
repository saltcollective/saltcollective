import { redirect, fail } from '@sveltejs/kit';
import { prisma } from '@saltcollective/schema';
import { getClubAccess } from '$lib/server/club-access';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
  const { club } = await parent();

  const tiers = await prisma.sponsorTier.findMany({
    where: { clubId: club.id },
    orderBy: { order: 'asc' },
    select: { id: true, name: true },
  });

  return { tiers };
};

export const actions: Actions = {
  create: async ({ request, locals, cookies }) => {
    if (!locals.user) redirect(302, '/sign-in');

    const access = await getClubAccess(locals, cookies);
    if (!access) redirect(302, '/onboarding/club');

    const clubId = access.club.id;
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

    await prisma.business.create({
      data: {
        clubId,
        sponsorTierId,
        name,
        description,
        email,
        phone,
        websiteUrl,
        logoUrl,
        status: isActive ? 'ACTIVE' : 'ARCHIVED',
        source: 'admin',
      },
    });

    redirect(302, '/dashboard/sponsors');
  },
};
