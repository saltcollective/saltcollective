import { redirect, fail } from '@sveltejs/kit';
import { prisma } from '@saltcollective/schema';
import { logAudit } from '$lib/server/audit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  return { user: locals.user };
};

export const actions: Actions = {
  accept: async ({ request, locals }) => {
    if (!locals.user) return fail(401, { error: 'You must be signed in to accept an invite' });

    const fd = await request.formData();
    const token = (fd.get('token') as string)?.trim();

    if (!token) return fail(400, { error: 'Invalid invite link' });

    const invite = await prisma.clubInvite.findUnique({
      where: { token },
      select: { id: true, clubId: true, email: true, role: true, status: true, expiresAt: true },
    });

    if (!invite || invite.status !== 'PENDING') {
      return fail(400, { error: 'This invite is no longer valid' });
    }

    if (invite.expiresAt && invite.expiresAt < new Date()) {
      return fail(400, { error: 'This invite has expired' });
    }

    if (invite.email !== locals.user.email) {
      return fail(403, { error: 'This invite was sent to a different email address' });
    }

    try {
      await prisma.$transaction([
        prisma.clubMembership.create({
          data: { userId: locals.user.id, clubId: invite.clubId, role: invite.role },
        }),
        prisma.clubInvite.update({
          where: { id: invite.id },
          data: { status: 'ACCEPTED' },
        }),
      ]);
      const club = await prisma.club.findUnique({
        where: { id: invite.clubId },
        select: { name: true },
      });
      await logAudit({
        entityType: 'CLUB',
        entityId: invite.clubId,
        entityName: club?.name ?? invite.clubId,
        type: 'MEMBER_JOINED',
        actor: { id: locals.user.id, email: locals.user.email },
        detail: `${locals.user.email} joined as ${invite.role}`,
      });
    } catch {
      // Already a member — still mark invite accepted and continue
      await prisma.clubInvite.update({
        where: { id: invite.id },
        data: { status: 'ACCEPTED' },
      });
    }

    redirect(302, '/dashboard');
  },
};
