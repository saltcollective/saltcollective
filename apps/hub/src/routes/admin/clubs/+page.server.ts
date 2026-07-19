import { fail, redirect } from '@sveltejs/kit';
import { prisma } from '@saltcollective/schema';
import { setClubStatus, deleteClub } from '$lib/server/admin-clubs';
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

    const result = await setClubStatus(clubId, status, {
      id: locals.user.id,
      email: locals.user.email,
    });
    if (!result.ok) return fail(404, { error: result.error });

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

    const result = await deleteClub(clubId, { id: locals.user.id, email: locals.user.email });
    if (!result.ok) return fail(404, { error: result.error });

    return { success: true };
  },
};
