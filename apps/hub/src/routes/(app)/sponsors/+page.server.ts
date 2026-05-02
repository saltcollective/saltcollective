import { prisma } from '@saltcollective/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
  const { club } = await parent();

  const [businesses, tiers] = await Promise.all([
    prisma.business.findMany({
      where: { clubId: club.id },
      orderBy: [{ sponsorTier: { order: 'asc' } }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        isActive: true,
        email: true,
        websiteUrl: true,
        logoUrl: true,
        sponsorTier: { select: { id: true, name: true } },
      },
    }),
    prisma.sponsorTier.findMany({
      where: { clubId: club.id },
      orderBy: { order: 'asc' },
      select: { id: true, name: true },
    }),
  ]);

  return { businesses, tiers };
};
