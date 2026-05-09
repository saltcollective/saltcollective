import { redirect, fail } from '@sveltejs/kit';
import { prisma } from '@saltcollective/schema';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
  if (!locals.user) redirect(302, '/sign-in');

  const clubId = url.searchParams.get('club');
  if (!clubId) redirect(302, '/onboarding/club');

  const membership = await prisma.clubMembership.findFirst({
    where: { userId: locals.user.id, clubId, role: 'ADMIN' },
    select: { clubId: true },
  });
  if (!membership) redirect(302, '/onboarding/club');

  return { clubId };
};

export const actions: Actions = {
  applyCode: async ({ request, locals, url }) => {
    if (!locals.user) redirect(302, '/sign-in');

    const clubId = url.searchParams.get('club');
    if (!clubId) redirect(302, '/onboarding/club');

    const membership = await prisma.clubMembership.findFirst({
      where: { userId: locals.user.id, clubId, role: 'ADMIN' },
      select: { clubId: true },
    });
    if (!membership) redirect(302, '/onboarding/club');

    const existing = await prisma.discountCode.findFirst({
      where: { redeemedByClubId: clubId },
      select: { id: true },
    });
    if (existing) return fail(400, { codeError: 'This club has already redeemed a discount code' });

    const fd = await request.formData();
    const code = (fd.get('code') as string)?.trim().toUpperCase();
    if (!code) return fail(400, { codeError: 'Please enter a discount code' });

    const discountCode = await prisma.discountCode.findUnique({
      where: { code },
      select: { id: true, redeemedByClubId: true },
    });

    if (!discountCode) return fail(400, { codeError: 'Invalid code — please check and try again' });
    if (discountCode.redeemedByClubId) return fail(400, { codeError: 'This code has already been used' });

    await prisma.discountCode.update({
      where: { id: discountCode.id },
      data: { redeemedByClubId: clubId, redeemedAt: new Date() },
    });

    redirect(302, `/onboarding/done?club=${clubId}`);
  },
};
