import { fail, redirect } from '@sveltejs/kit';
import { prisma } from '@saltcollective/schema';
import { logAudit } from '$lib/server/audit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
  const clubs = await prisma.club.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      createdAt: true,
      _count: { select: { memberships: true, businesses: true } },
    },
  });

  return { clubs };
};

// Layout guards don't protect actions — each action re-checks SITE_ADMIN itself.
export const actions: Actions = {
  setStatus: async ({ request, locals }) => {
    if (!locals.user) redirect(302, '/sign-in');
    if (locals.user.userType !== 'SITE_ADMIN') {
      return fail(403, { error: 'Site admin access required' });
    }

    const fd = await request.formData();
    const clubId = fd.get('clubId') as string;
    const rawStatus = fd.get('status') as string;
    const status = rawStatus === 'ACTIVE' || rawStatus === 'SUSPENDED' ? rawStatus : null;
    if (!clubId || !status) return fail(400, { error: 'Invalid request' });

    const club = await prisma.club.findUnique({
      where: { id: clubId },
      select: { id: true, name: true },
    });
    if (!club) return fail(404, { error: 'Club not found' });

    await prisma.club.update({
      where: { id: clubId },
      data:
        status === 'SUSPENDED'
          ? { status, suspendedAt: new Date() }
          : { status, suspendedAt: null },
    });
    await logAudit({
      entityType: 'CLUB',
      entityId: clubId,
      entityName: club.name,
      type: status === 'SUSPENDED' ? 'CLUB_SUSPENDED' : 'CLUB_REACTIVATED',
      actor: { id: locals.user.id, email: locals.user.email },
    });

    return { success: true };
  },

  delete: async ({ request, locals }) => {
    if (!locals.user) redirect(302, '/sign-in');
    if (locals.user.userType !== 'SITE_ADMIN') {
      return fail(403, { error: 'Site admin access required' });
    }

    const fd = await request.formData();
    const clubId = fd.get('clubId') as string;
    if (!clubId) return fail(400, { error: 'Invalid request' });

    const club = await prisma.club.findUnique({
      where: { id: clubId },
      select: { id: true, name: true },
    });
    if (!club) return fail(404, { error: 'Club not found' });

    // No onDelete cascades in the schema — remove dependents in FK order.
    // Implicit business↔tag join rows cascade with the businesses/tags themselves.
    await prisma.$transaction([
      prisma.clickEvent.deleteMany({ where: { clubId } }),
      prisma.clubInvite.deleteMany({ where: { clubId } }),
      prisma.clubMembership.deleteMany({ where: { clubId } }),
      prisma.business.deleteMany({ where: { clubId } }),
      prisma.sponsorTier.deleteMany({ where: { clubId } }),
      prisma.tag.deleteMany({ where: { clubId } }),
      prisma.discountCode.updateMany({
        where: { redeemedByClubId: clubId },
        data: { redeemedByClubId: null },
      }),
      prisma.club.delete({ where: { id: clubId } }),
    ]);

    await logAudit({
      entityType: 'CLUB',
      entityId: clubId,
      entityName: club.name,
      type: 'CLUB_DELETED',
      actor: { id: locals.user.id, email: locals.user.email },
    });

    return { success: true };
  },
};
