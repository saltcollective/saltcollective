import { redirect, fail, error } from '@sveltejs/kit';
import { prisma } from '@saltcollective/schema';
import { getClubAccess } from '$lib/server/club-access';
import { deleteClub } from '$lib/server/admin-clubs';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
  const { club, role } = await parent();
  if (role !== 'ADMIN') error(403, 'Admin access required');

  const fullClub = await prisma.club.findUnique({
    where: { id: club.id },
    select: {
      id: true, name: true, slug: true, tagline: true,
      logoUrl: true, primaryColour: true, secondaryColour: true,
      backgroundColour: true, colorScheme: true,
    },
  });

  if (!fullClub) error(404, 'Club not found');

  return { club: fullClub };
};

export const actions: Actions = {
  updateIdentity: async ({ request, locals, cookies }) => {
    if (!locals.user) redirect(302, '/sign-in');

    const access = await getClubAccess(locals, cookies);
    if (!access || access.role !== 'ADMIN') {
      return fail(403, { updated: 'identity' as const, error: 'Admin access required', slugTaken: false as boolean });
    }

    const clubId = access.club.id;
    const fd = await request.formData();
    const name = (fd.get('name') as string)?.trim();
    const slug = (fd.get('slug') as string)?.trim().toLowerCase();
    const tagline = (fd.get('tagline') as string)?.trim() || null;

    const base = { updated: 'identity' as const, name, slug, tagline, slugTaken: false as boolean };

    if (!name) return fail(400, { ...base, error: 'Club name is required' });
    if (!slug || slug.length < 2 || !/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(slug)) {
      return fail(400, { ...base, error: 'Slug must be at least 2 characters — lowercase letters, numbers, and hyphens only' });
    }

    if (slug !== access.club.slug) {
      const existing = await prisma.club.findUnique({ where: { slug }, select: { id: true } });
      if (existing) return fail(400, { ...base, error: 'That URL is already taken — try a different one', slugTaken: true });
    }

    await prisma.club.update({ where: { id: clubId }, data: { name, slug, tagline } });
    await prisma.$accelerate.invalidate({ tags: [`club_${access.club.slug.replace(/-/g, '_')}`] });
    return { updated: 'identity' as const, success: true, slugTaken: false as boolean };
  },

  updateBranding: async ({ request, locals, cookies }) => {
    if (!locals.user) redirect(302, '/sign-in');

    const access = await getClubAccess(locals, cookies);
    if (!access || access.role !== 'ADMIN') {
      return fail(403, { updated: 'branding' as const, error: 'Admin access required' });
    }

    const clubId = access.club.id;
    const fd = await request.formData();
    const logoUrl = (fd.get('logoUrl') as string)?.trim() || null;
    const primaryColour = (fd.get('primaryColour') as string)?.trim() || null;
    const secondaryColour = (fd.get('secondaryColour') as string)?.trim() || null;
    const backgroundColour = (fd.get('backgroundColour') as string)?.trim() || null;
    const rawScheme = (fd.get('colorScheme') as string)?.trim();
    const colorScheme = rawScheme === 'LIGHT' || rawScheme === 'DARK' || rawScheme === 'SYSTEM' ? rawScheme : 'SYSTEM';

    await prisma.club.update({ where: { id: clubId }, data: { logoUrl, primaryColour, secondaryColour, backgroundColour, colorScheme } });
    await prisma.$accelerate.invalidate({ tags: [`club_${access.club.slug.replace(/-/g, '_')}`] });
    return { updated: 'branding' as const, success: true };
  },

  deleteClub: async ({ request, locals, cookies }) => {
    if (!locals.user) redirect(302, '/sign-in');

    const access = await getClubAccess(locals, cookies);
    if (!access || access.role !== 'ADMIN') {
      return fail(403, { error: 'Admin access required' });
    }

    const { id: clubId, name: clubName } = access.club;
    const fd = await request.formData();
    const confirmName = (fd.get('confirmName') as string)?.trim();

    if (confirmName !== clubName) {
      return fail(400, { error: 'Club name does not match', deleted: false });
    }

    const result = await deleteClub(clubId, { id: locals.user.id, email: locals.user.email });
    if (!result.ok) return fail(404, { error: result.error });

    redirect(302, '/onboarding/club');
  },
};
