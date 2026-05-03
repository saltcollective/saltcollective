import { error, redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  if (!locals.user) redirect(302, '/sign-in');
  if (locals.user.userType !== 'SITE_ADMIN') error(403, 'Access denied');
  return { user: locals.user };
};
