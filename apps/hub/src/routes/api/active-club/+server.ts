import { redirect } from '@sveltejs/kit';
import { prisma } from '@saltcollective/schema';
import { ACTIVE_CLUB_COOKIE } from '$lib/server/club-access';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals, cookies }) => {
  if (!locals.user) redirect(303, '/sign-in');

  const fd = await request.formData();
  const value = fd.get('value') as string;

  if (value === 'new') {
    redirect(303, '/onboarding/club?new=1');
  }

  if (value) {
    const membership = await prisma.clubMembership.findFirst({
      where: { userId: locals.user.id, clubId: value },
      select: { id: true },
    });
    if (membership) {
      cookies.set(ACTIVE_CLUB_COOKIE, value, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365,
      });
    }
  }

  redirect(303, '/dashboard');
};
