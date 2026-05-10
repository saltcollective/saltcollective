import { redirect, fail, error } from '@sveltejs/kit';
import { prisma } from '@saltcollective/schema';
import { sendInviteEmail } from '$lib/server/email';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
  const { club, role } = await parent();
  if (role !== 'ADMIN') error(403, 'Admin access required');

  const [members, invites] = await Promise.all([
    prisma.clubMembership.findMany({
      where: { clubId: club.id },
      select: {
        id: true,
        role: true,
        createdAt: true,
        user: { select: { id: true, username: true, email: true } },
      },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.clubInvite.findMany({
      where: { clubId: club.id, status: 'PENDING' },
      select: { id: true, email: true, role: true, createdAt: true, expiresAt: true },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return { members, invites };
};

export const actions: Actions = {
  invite: async ({ request, locals, url, parent }) => {
    if (!locals.user) redirect(302, '/sign-in');

    const membership = await prisma.clubMembership.findFirst({
      where: { userId: locals.user.id, role: 'ADMIN' },
      select: { club: { select: { id: true, name: true } } },
    });
    if (!membership) return fail(403, { action: 'invite' as const, error: 'Admin access required' });

    const { id: clubId, name: clubName } = membership.club;
    const fd = await request.formData();
    const email = (fd.get('email') as string)?.trim().toLowerCase();
    const rawRole = fd.get('role') as string;
    const role = rawRole === 'ADMIN' || rawRole === 'EDITOR' ? rawRole : 'EDITOR';

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return fail(400, { action: 'invite' as const, error: 'Valid email address required' });
    }

    // Check not already a member
    const existingMember = await prisma.clubMembership.findFirst({
      where: { clubId, user: { email } },
    });
    if (existingMember) {
      return fail(400, { action: 'invite' as const, error: 'That person is already a member of this hub' });
    }

    // Check no existing pending invite
    const existingInvite = await prisma.clubInvite.findUnique({
      where: { clubId_email: { clubId, email } },
    });
    if (existingInvite && existingInvite.status === 'PENDING') {
      return fail(400, { action: 'invite' as const, error: 'An invite has already been sent to that address' });
    }

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Upsert in case a previous invite was revoked
    const invite = existingInvite
      ? await prisma.clubInvite.update({
          where: { id: existingInvite.id },
          data: { role, status: 'PENDING', expiresAt, token: crypto.randomUUID() },
        })
      : await prisma.clubInvite.create({
          data: { clubId, email, role, expiresAt },
        });

    const inviterName = locals.user.username ?? locals.user.email;
    const inviteUrl = `${url.origin}/invite?code=${invite.token}`;

    await sendInviteEmail({ to: email, clubName, inviterName, inviteUrl });

    return { action: 'invite' as const, success: true };
  },

  revoke: async ({ request, locals }) => {
    if (!locals.user) redirect(302, '/sign-in');

    const membership = await prisma.clubMembership.findFirst({
      where: { userId: locals.user.id, role: 'ADMIN' },
      select: { club: { select: { id: true } } },
    });
    if (!membership) return fail(403, { action: 'revoke' as const, error: 'Admin access required' });

    const fd = await request.formData();
    const inviteId = fd.get('inviteId') as string;

    await prisma.clubInvite.updateMany({
      where: { id: inviteId, clubId: membership.club.id },
      data: { status: 'REVOKED' },
    });

    return { action: 'revoke' as const, success: true };
  },
};
