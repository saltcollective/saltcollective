import { redirect, fail } from '@sveltejs/kit';
import { prisma } from '@saltcollective/schema';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
  const { club } = await parent();

  const raw = await prisma.sponsorTier.findMany({
    where: { clubId: club.id },
    orderBy: { order: 'asc' },
    select: {
      id: true,
      name: true,
      price: true,
      _count: { select: { businesses: true } },
    },
  });

  return {
    tiers: raw.map((t) => ({
      id: t.id,
      name: t.name,
      price: t.price ? t.price.toString() : '',
      businessCount: t._count.businesses,
    })),
  };
};

export const actions: Actions = {
  save: async ({ request, locals }) => {
    if (!locals.user) redirect(302, '/sign-in');

    const membership = await prisma.clubMembership.findFirst({
      where: { userId: locals.user.id },
      select: { club: { select: { id: true } } },
    });
    if (!membership) redirect(302, '/onboarding/club');

    const clubId = membership.club.id;
    const fd = await request.formData();

    let submitted: Array<{ id?: string; name: string; price: string }>;
    try {
      submitted = JSON.parse(fd.get('tiers') as string);
    } catch {
      return fail(400, { error: 'Invalid tier data' });
    }

    if (!submitted.length) return fail(400, { error: 'At least one tier is required' });
    if (submitted.some((t) => !t.name.trim())) return fail(400, { error: 'All tiers must have a name' });

    const existing = await prisma.sponsorTier.findMany({
      where: { clubId },
      select: { id: true, _count: { select: { businesses: true } } },
    });

    const submittedIds = new Set(submitted.map((t) => t.id).filter(Boolean));
    const toDelete = existing.filter((t) => !submittedIds.has(t.id));
    const blocked = toDelete.find((t) => t._count.businesses > 0);

    if (blocked) {
      return fail(400, {
        error: 'One or more removed tiers still have sponsors assigned. Reassign or delete those sponsors first.',
      });
    }

    await prisma.$transaction(async (tx) => {
      if (toDelete.length) {
        await tx.sponsorTier.deleteMany({ where: { id: { in: toDelete.map((t) => t.id) } } });
      }

      // Move existing tiers to high temp orders to avoid unique constraint conflicts
      const keptExisting = submitted.filter((t) => t.id);
      for (let i = 0; i < keptExisting.length; i++) {
        await tx.sponsorTier.update({
          where: { id: keptExisting[i].id },
          data: { order: 10000 + i },
        });
      }

      // Apply final names, prices and orders; create new tiers
      for (let i = 0; i < submitted.length; i++) {
        const t = submitted[i];
        const price = t.price ? parseFloat(t.price) : null;
        if (t.id) {
          await tx.sponsorTier.update({
            where: { id: t.id },
            data: { name: t.name.trim(), price, order: i },
          });
        } else {
          await tx.sponsorTier.create({
            data: { clubId, name: t.name.trim(), price, order: i },
          });
        }
      }
    });

    return { success: true };
  },
};
