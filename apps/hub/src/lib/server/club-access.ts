import type { Cookies } from '@sveltejs/kit';
import { prisma } from '@saltcollective/schema';

export const IMPERSONATION_COOKIE = 'impersonation_session';
export const ACTIVE_CLUB_COOKIE = 'active_club';

export interface ClubAccess {
  club: { id: string; name: string; slug: string; logoUrl: string | null };
  role: 'ADMIN' | 'EDITOR';
  impersonating: boolean;
}

// Central club resolution for the (app) dashboard: an active impersonation
// session (SITE_ADMIN only) wins, otherwise the user's own membership.
// Multi-club support will extend this with an "active club" selection.
export async function getClubAccess(
  locals: App.Locals,
  cookies: Cookies,
): Promise<ClubAccess | null> {
  if (!locals.user) return null;

  const sessionId = cookies.get(IMPERSONATION_COOKIE);
  if (sessionId && locals.user.userType === 'SITE_ADMIN') {
    const session = await prisma.impersonationLog.findFirst({
      where: { id: sessionId, impersonatorId: locals.user.id, endedAt: null },
      select: { id: true, clubId: true },
    });
    if (session) {
      const club = await prisma.club.findUnique({
        where: { id: session.clubId },
        select: { id: true, name: true, slug: true, logoUrl: true },
      });
      if (club) {
        return { club, role: 'ADMIN', impersonating: true };
      }
      // Club was deleted mid-session — close the session and fall through.
      await prisma.impersonationLog.update({
        where: { id: session.id },
        data: { endedAt: new Date() },
      });
      cookies.delete(IMPERSONATION_COOKIE, { path: '/' });
    }
  }

  // Selected active club (multi-club). A stale cookie — membership revoked or
  // club deleted — silently falls through to the default.
  const activeClubId = cookies.get(ACTIVE_CLUB_COOKIE);
  if (activeClubId) {
    const selected = await prisma.clubMembership.findFirst({
      where: { userId: locals.user.id, clubId: activeClubId },
      select: {
        role: true,
        club: { select: { id: true, name: true, slug: true, logoUrl: true } },
      },
    });
    if (selected) {
      return { club: selected.club, role: selected.role, impersonating: false };
    }
  }

  const membership = await prisma.clubMembership.findFirst({
    where: { userId: locals.user.id },
    orderBy: { createdAt: 'asc' },
    select: {
      role: true,
      club: { select: { id: true, name: true, slug: true, logoUrl: true } },
    },
  });
  if (!membership) return null;

  return { club: membership.club, role: membership.role, impersonating: false };
}
