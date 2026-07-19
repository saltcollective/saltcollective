import { redirect } from '@sveltejs/kit';
import { prisma } from '@saltcollective/schema';
import { logAudit } from '$lib/server/audit';
import { IMPERSONATION_COOKIE } from '$lib/server/club-access';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals, cookies }) => {
  const sessionId = cookies.get(IMPERSONATION_COOKIE);
  cookies.delete(IMPERSONATION_COOKIE, { path: '/' });

  if (sessionId && locals.user) {
    const session = await prisma.impersonationLog.findFirst({
      where: { id: sessionId, impersonatorId: locals.user.id, endedAt: null },
      select: { id: true, clubId: true, clubName: true },
    });
    if (session) {
      await prisma.impersonationLog.update({
        where: { id: session.id },
        data: { endedAt: new Date() },
      });
      await logAudit({
        entityType: 'CLUB',
        entityId: session.clubId,
        entityName: session.clubName,
        type: 'CLUB_IMPERSONATION_ENDED',
        actor: { id: locals.user.id, email: locals.user.email },
      });
      redirect(303, `/admin/clubs/${session.clubId}`);
    }
  }

  redirect(303, '/admin/clubs');
};
