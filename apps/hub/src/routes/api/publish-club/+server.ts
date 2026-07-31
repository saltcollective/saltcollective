import { error, redirect } from '@sveltejs/kit';
import { publishClub } from '$lib/server/admin-clubs';
import { getClubAccess } from '$lib/server/club-access';
import type { RequestHandler } from './$types';

// Publishes the caller's active club (banner CTA in the (app) shell). During
// impersonation the audit actor is the site admin's real identity.
export const POST: RequestHandler = async ({ locals, cookies }) => {
  if (!locals.user) redirect(303, '/sign-in');

  const access = await getClubAccess(locals, cookies);
  if (!access) redirect(303, '/onboarding/club');
  if (access.role !== 'ADMIN') error(403, 'Admin access required');

  const result = await publishClub(access.club.id, {
    id: locals.user.id,
    email: locals.user.email,
  });
  if (!result.ok) error(404, result.error);

  redirect(303, '/dashboard');
};
