import { fail } from '@sveltejs/kit';
import { prisma } from '@saltcollective/schema';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
  const codes = await prisma.discountCode.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      code: true,
      description: true,
      createdAt: true,
      expiresAt: true,
      redeemedAt: true,
      createdBy: { select: { email: true } },
      redeemedBy: { select: { name: true } },
    },
  });

  return { codes };
};

export const actions: Actions = {
  create: async ({ request, locals }) => {
    const fd = await request.formData();
    const raw = (fd.get('code') as string)?.trim().toUpperCase();
    const description = (fd.get('description') as string)?.trim() || null;

    let code: string;
    if (!raw) {
      code = crypto.randomUUID().replace(/-/g, '').slice(0, 10).toUpperCase();
    } else {
      if (!/^[A-Z0-9]{8,16}$/.test(raw)) {
        return fail(400, { error: 'Code must be 8–16 uppercase letters and numbers', code: raw, description });
      }
      code = raw;
    }

    const existing = await prisma.discountCode.findUnique({ where: { code }, select: { id: true } });
    if (existing) {
      return fail(400, { error: 'That code already exists — try a different one', code: raw, description });
    }

    await prisma.discountCode.create({
      data: { code, description, createdByUserId: locals.user!.id },
    });

    return { success: true };
  },

  delete: async ({ request }) => {
    const fd = await request.formData();
    const id = (fd.get('id') as string)?.trim();
    if (!id) return fail(400, { error: 'Missing code ID' });

    const code = await prisma.discountCode.findUnique({
      where: { id },
      select: { id: true, redeemedByClubId: true },
    });

    if (!code) return fail(404, { error: 'Code not found' });
    if (code.redeemedByClubId) return fail(400, { error: 'Cannot delete a redeemed code' });

    await prisma.discountCode.delete({ where: { id } });
    return { success: true };
  },
};
