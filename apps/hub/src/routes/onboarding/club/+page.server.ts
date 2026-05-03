import { redirect, fail } from '@sveltejs/kit';
import { prisma } from '@saltcollective/schema';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) redirect(302, '/sign-in');

  const membership = await prisma.clubMembership.findFirst({
    where: { userId: locals.user.id },
    select: { clubId: true },
  });
  if (membership) redirect(302, '/dashboard');

  return {};
};

export const actions: Actions = {
  create: async ({ request, locals }) => {
    if (!locals.user) redirect(302, '/sign-in');

    const data = await request.formData();
    const name = (data.get('name') as string)?.trim();
    const slug = (data.get('slug') as string)?.trim().toLowerCase();
    const tagline = (data.get('tagline') as string)?.trim() || null;

    const base = { name, slug, tagline, slugTaken: false as boolean };

    if (!name) return fail(400, { ...base, error: 'Club name is required' });

    if (!slug || slug.length < 2 || !/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(slug)) {
      return fail(400, { ...base, error: 'Slug must be at least 2 characters — lowercase letters, numbers, and hyphens only' });
    }

    const existing = await prisma.club.findUnique({ where: { slug }, select: { id: true } });
    if (existing) {
      return fail(400, { ...base, error: 'That URL is already taken — try a different one', slugTaken: true });
    }

    const club = await prisma.club.create({ data: { name, slug, tagline } });
    await prisma.clubMembership.create({
      data: { userId: locals.user.id, clubId: club.id, role: 'ADMIN' },
    });

    redirect(302, `/onboarding/branding?club=${club.id}`);
  },
};
