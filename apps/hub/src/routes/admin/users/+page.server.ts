import { fail, redirect } from '@sveltejs/kit';
import { prisma } from '@saltcollective/schema';
import { clerkClient } from 'svelte-clerk/server';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      username: true,
      userType: true,
      isActive: true,
      createdAt: true,
      memberships: {
        select: {
          role: true,
          club: { select: { name: true, slug: true } },
        },
      },
    },
  });

  return { users, currentUserId: locals.user?.id ?? null };
};

// Layout guards don't protect actions — each action re-checks SITE_ADMIN itself.
function requireSiteAdmin(locals: App.Locals) {
  if (!locals.user) redirect(302, '/sign-in');
  if (locals.user.userType !== 'SITE_ADMIN') return null;
  return locals.user;
}

export const actions: Actions = {
  setUserType: async ({ request, locals }) => {
    const actor = requireSiteAdmin(locals);
    if (!actor) return fail(403, { error: 'Site admin access required' });

    const fd = await request.formData();
    const userId = fd.get('userId') as string;
    const rawType = fd.get('userType') as string;
    const userType = rawType === 'SITE_ADMIN' || rawType === 'MEMBER' ? rawType : null;
    if (!userId || !userType) return fail(400, { error: 'Invalid request' });

    if (userId === actor.id) {
      return fail(400, { error: "You can't change your own site admin role" });
    }

    const target = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, userType: true },
    });
    if (!target) return fail(404, { error: 'User not found' });

    if (target.userType === 'SITE_ADMIN' && userType === 'MEMBER') {
      const adminCount = await prisma.user.count({ where: { userType: 'SITE_ADMIN' } });
      if (adminCount <= 1) {
        return fail(400, { error: 'The platform needs at least one site admin' });
      }
    }

    if (target.userType !== userType) {
      await prisma.user.update({ where: { id: userId }, data: { userType } });
    }

    return { success: true };
  },

  setActive: async ({ request, locals }) => {
    const actor = requireSiteAdmin(locals);
    if (!actor) return fail(403, { error: 'Site admin access required' });

    const fd = await request.formData();
    const userId = fd.get('userId') as string;
    const active = fd.get('active') === 'true';
    if (!userId) return fail(400, { error: 'Invalid request' });

    if (userId === actor.id) {
      return fail(400, { error: "You can't deactivate your own account" });
    }

    const target = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, clerkId: true, email: true },
    });
    if (!target) return fail(404, { error: 'User not found' });

    // Clerk ban/unban first — it's the stronger guarantee (blocks fresh sign-ins).
    // The DB flag + layout redirects handle sessions that are already live.
    try {
      if (active) {
        await clerkClient.users.unbanUser(target.clerkId);
      } else {
        await clerkClient.users.banUser(target.clerkId);
      }
    } catch (e) {
      const detail = e instanceof Error ? e.message : String(e);
      return fail(500, {
        error: `Clerk ${active ? 'unban' : 'ban'} failed for ${target.email}: ${detail}`,
      });
    }

    await prisma.user.update({
      where: { id: userId },
      data: active
        ? { isActive: true, deactivatedAt: null }
        : { isActive: false, deactivatedAt: new Date() },
    });

    return { success: true };
  },

  delete: async ({ request, locals }) => {
    const actor = requireSiteAdmin(locals);
    if (!actor) return fail(403, { error: 'Site admin access required' });

    const fd = await request.formData();
    const userId = fd.get('userId') as string;
    if (!userId) return fail(400, { error: 'Invalid request' });

    if (userId === actor.id) {
      return fail(400, { error: "You can't delete your own account" });
    }

    const target = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        clerkId: true,
        email: true,
        userType: true,
        memberships: {
          where: { role: 'ADMIN' },
          select: { club: { select: { id: true, name: true } } },
        },
        _count: { select: { discountCodes: true } },
      },
    });
    if (!target) return fail(404, { error: 'User not found' });

    if (target.userType === 'SITE_ADMIN') {
      return fail(400, { error: 'Demote them from site admin before deleting' });
    }

    if (target._count.discountCodes > 0) {
      return fail(400, {
        error: `${target.email} created ${target._count.discountCodes} discount code(s) — those records reference them and must be removed first`,
      });
    }

    // Block deletion while they're the only ADMIN of any club — the club would be orphaned.
    const soleAdminOf: string[] = [];
    for (const m of target.memberships) {
      const adminCount = await prisma.clubMembership.count({
        where: { clubId: m.club.id, role: 'ADMIN' },
      });
      if (adminCount <= 1) soleAdminOf.push(m.club.name);
    }
    if (soleAdminOf.length > 0) {
      return fail(400, {
        error: `${target.email} is the only admin of: ${soleAdminOf.join(', ')}. Transfer those clubs to another admin or delete them first.`,
      });
    }

    // Clerk first — otherwise the hooks would re-provision the user on their next request.
    try {
      await clerkClient.users.deleteUser(target.clerkId);
    } catch (e) {
      const detail = e instanceof Error ? e.message : String(e);
      return fail(500, { error: `Clerk delete failed for ${target.email}: ${detail}` });
    }

    await prisma.$transaction([
      prisma.impersonationLog.deleteMany({
        where: { OR: [{ impersonatorId: userId }, { impersonatedId: userId }] },
      }),
      prisma.clubMembership.deleteMany({ where: { userId } }),
      prisma.user.delete({ where: { id: userId } }),
    ]);

    return { success: true };
  },
};
