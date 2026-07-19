import { redirect } from '@sveltejs/kit';
import { getClubAccess } from '$lib/server/club-access';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, cookies }) => {
  if (!locals.user) redirect(302, '/sign-in');
  if (!locals.user.isActive) redirect(302, '/account-deactivated');

  const access = await getClubAccess(locals, cookies);
  if (!access) redirect(302, '/onboarding/club');

  return { club: access.club, role: access.role, impersonating: access.impersonating };
};
