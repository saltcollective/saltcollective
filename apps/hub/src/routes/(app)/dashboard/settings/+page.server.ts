import { redirect, fail, error } from '@sveltejs/kit';
import { prisma } from '@saltcollective/schema';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
  const { club, role } = await parent();
  if (role !== 'ADMIN') error(403, 'Admin access required');

  const fullClub = await prisma.club.findUnique({
    where: { id: club.id },
    select: {
      id: true, name: true, slug: true, tagline: true,
      logoUrl: true, primaryColour: true, secondaryColour: true,
    },
  });

  if (!fullClub) error(404, 'Club not found');

  return { club: fullClub };
};

export const actions: Actions = {
  updateIdentity: async ({ request, locals }) => {
    if (!locals.user) redirect(302, '/sign-in');

    const membership = await prisma.clubMembership.findFirst({
      where: { userId: locals.user.id, role: 'ADMIN' },
      select: { club: { select: { id: true, slug: true } } },
    });
    if (!membership) return fail(403, { updated: 'identity' as const, error: 'Admin access required', slugTaken: false as boolean });

    const clubId = membership.club.id;
    const fd = await request.formData();
    const name = (fd.get('name') as string)?.trim();
    const slug = (fd.get('slug') as string)?.trim().toLowerCase();
    const tagline = (fd.get('tagline') as string)?.trim() || null;

    const base = { updated: 'identity' as const, name, slug, tagline, slugTaken: false as boolean };

    if (!name) return fail(400, { ...base, error: 'Club name is required' });
    if (!slug || slug.length < 2 || !/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(slug)) {
      return fail(400, { ...base, error: 'Slug must be at least 2 characters — lowercase letters, numbers, and hyphens only' });
    }

    if (slug !== membership.club.slug) {
      const existing = await prisma.club.findUnique({ where: { slug }, select: { id: true } });
      if (existing) return fail(400, { ...base, error: 'That URL is already taken — try a different one', slugTaken: true });
    }

    await prisma.club.update({ where: { id: clubId }, data: { name, slug, tagline } });
    return { updated: 'identity' as const, success: true, slugTaken: false as boolean };
  },

  updateBranding: async ({ request, locals }) => {
    if (!locals.user) redirect(302, '/sign-in');

    const membership = await prisma.clubMembership.findFirst({
      where: { userId: locals.user.id, role: 'ADMIN' },
      select: { club: { select: { id: true } } },
    });
    if (!membership) return fail(403, { updated: 'branding' as const, error: 'Admin access required' });

    const clubId = membership.club.id;
    const fd = await request.formData();
    const logoUrl = (fd.get('logoUrl') as string)?.trim() || null;
    const primaryColour = (fd.get('primaryColour') as string)?.trim() || null;
    const secondaryColour = (fd.get('secondaryColour') as string)?.trim() || null;

    await prisma.club.update({ where: { id: clubId }, data: { logoUrl, primaryColour, secondaryColour } });
    return { updated: 'branding' as const, success: true };
  },

  deleteClub: async ({ request, locals }) => {
    if (!locals.user) redirect(302, '/sign-in');

    const membership = await prisma.clubMembership.findFirst({
      where: { userId: locals.user.id, role: 'ADMIN' },
      select: { club: { select: { id: true, name: true } } },
    });
    if (!membership) return fail(403, { error: 'Admin access required' });

    const { id: clubId, name: clubName } = membership.club;
    const fd = await request.formData();
    const confirmName = (fd.get('confirmName') as string)?.trim();

    if (confirmName !== clubName) {
      return fail(400, { error: 'Club name does not match', deleted: false });
    }

    await prisma.$transaction([
      prisma.clickEvent.deleteMany({ where: { clubId } }),
      prisma.business.deleteMany({ where: { clubId } }),
      prisma.sponsorTier.deleteMany({ where: { clubId } }),
      prisma.tag.deleteMany({ where: { clubId } }),
      prisma.clubMembership.deleteMany({ where: { clubId } }),
      prisma.club.delete({ where: { id: clubId } }),
    ]);

    redirect(302, '/onboarding/club');
  },
};
