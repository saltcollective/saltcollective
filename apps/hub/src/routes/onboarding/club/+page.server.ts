import { redirect, fail } from '@sveltejs/kit';
import { prisma } from '@saltcollective/schema';
import { RESERVED_SLUGS } from '$lib/server/reserved-slugs';
import { logAudit } from '$lib/server/audit';
import { ACTIVE_CLUB_COOKIE } from '$lib/server/club-access';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
  if (!locals.user) redirect(302, '/sign-in');

  // Explicit second-club creation via the club switcher's "＋ New club".
  if (url.searchParams.has('new')) return {};

  const membership = await prisma.clubMembership.findFirst({
    where: { userId: locals.user.id },
    select: { clubId: true },
  });
  if (membership) redirect(302, '/dashboard');

  return {};
};

export const actions: Actions = {
  create: async ({ request, locals, cookies }) => {
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

    if (RESERVED_SLUGS.has(slug)) {
      return fail(400, { ...base, error: 'That URL is reserved — try a different one', slugTaken: true });
    }

    const existing = await prisma.club.findUnique({ where: { slug }, select: { id: true } });
    if (existing) {
      return fail(400, { ...base, error: 'That URL is already taken — try a different one', slugTaken: true });
    }

    const club = await prisma.club.create({ data: { name, slug, tagline } });
    await prisma.clubMembership.create({
      data: { userId: locals.user.id, clubId: club.id, role: 'ADMIN' },
    });
    cookies.set(ACTIVE_CLUB_COOKIE, club.id, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
    });
    await logAudit({
      entityType: 'CLUB',
      entityId: club.id,
      entityName: club.name,
      type: 'CLUB_CREATED',
      actor: { id: locals.user.id, email: locals.user.email },
    });

    redirect(302, `/onboarding/branding?club=${club.id}`);
  },
};
