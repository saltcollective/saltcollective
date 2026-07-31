import { error, fail, redirect } from '@sveltejs/kit';
import { prisma } from '@saltcollective/schema';
import { setClubStatus, deleteClub, publishClub } from '$lib/server/admin-clubs';
import { logAudit } from '$lib/server/audit';
import { IMPERSONATION_COOKIE } from '$lib/server/club-access';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [club, members, sponsors, clicks30d, recentEvents] = await Promise.all([
    prisma.club.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        slug: true,
        tagline: true,
        logoUrl: true,
        status: true,
        publishedAt: true,
        suspendedAt: true,
        paidUntil: true,
        createdAt: true,
      },
    }),
    prisma.clubMembership.findMany({
      where: { clubId: params.id },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        role: true,
        createdAt: true,
        user: { select: { id: true, username: true, email: true } },
      },
    }),
    prisma.business.findMany({
      where: { clubId: params.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        status: true,
        createdAt: true,
        sponsorTier: { select: { name: true } },
      },
    }),
    prisma.clickEvent.count({
      where: { clubId: params.id, createdAt: { gte: thirtyDaysAgo } },
    }),
    prisma.auditEvent.findMany({
      where: { entityType: 'CLUB', entityId: params.id },
      orderBy: { createdAt: 'desc' },
      take: 8,
      select: {
        id: true,
        type: true,
        entityName: true,
        actorEmail: true,
        detail: true,
        createdAt: true,
      },
    }),
  ]);

  if (!club) error(404, 'Club not found');

  return { club, members, sponsors, clicks30d, recentEvents };
};

// Layout guards don't protect actions — each action re-checks SITE_ADMIN itself.
export const actions: Actions = {
  setStatus: async ({ request, locals, params }) => {
    if (!locals.user) redirect(302, '/sign-in');
    if (locals.user.userType !== 'SITE_ADMIN') {
      return fail(403, { error: 'Site admin access required' });
    }

    const fd = await request.formData();
    const rawStatus = fd.get('status') as string;
    const status = rawStatus === 'ACTIVE' || rawStatus === 'SUSPENDED' ? rawStatus : null;
    if (!status) return fail(400, { error: 'Invalid request' });

    const result = await setClubStatus(params.id, status, {
      id: locals.user.id,
      email: locals.user.email,
    });
    if (!result.ok) return fail(404, { error: result.error });

    return { success: true };
  },

  publish: async ({ locals, params }) => {
    if (!locals.user) redirect(302, '/sign-in');
    if (locals.user.userType !== 'SITE_ADMIN') {
      return fail(403, { error: 'Site admin access required' });
    }

    const result = await publishClub(params.id, {
      id: locals.user.id,
      email: locals.user.email,
    });
    if (!result.ok) return fail(404, { error: result.error });

    return { success: true };
  },

  delete: async ({ locals, params }) => {
    if (!locals.user) redirect(302, '/sign-in');
    if (locals.user.userType !== 'SITE_ADMIN') {
      return fail(403, { error: 'Site admin access required' });
    }

    const result = await deleteClub(params.id, { id: locals.user.id, email: locals.user.email });
    if (!result.ok) return fail(404, { error: result.error });

    redirect(303, '/admin/clubs');
  },

  impersonate: async ({ locals, params, cookies }) => {
    if (!locals.user) redirect(302, '/sign-in');
    if (locals.user.userType !== 'SITE_ADMIN') {
      return fail(403, { error: 'Site admin access required' });
    }

    const club = await prisma.club.findUnique({
      where: { id: params.id },
      select: { id: true, name: true },
    });
    if (!club) return fail(404, { error: 'Club not found' });

    // One open session per admin — close any earlier ones (also tidies
    // sessions whose cookie expired without an explicit end).
    await prisma.impersonationLog.updateMany({
      where: { impersonatorId: locals.user.id, endedAt: null },
      data: { endedAt: new Date() },
    });

    const session = await prisma.impersonationLog.create({
      data: { impersonatorId: locals.user.id, clubId: club.id, clubName: club.name },
      select: { id: true },
    });

    cookies.set(IMPERSONATION_COOKIE, session.id, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 2,
    });

    await logAudit({
      entityType: 'CLUB',
      entityId: club.id,
      entityName: club.name,
      type: 'CLUB_IMPERSONATION_STARTED',
      actor: { id: locals.user.id, email: locals.user.email },
    });

    redirect(303, '/dashboard');
  },
};
