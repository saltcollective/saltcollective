import { error } from '@sveltejs/kit';
import { prisma } from '@saltcollective/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, setHeaders }) => {
  const club = await prisma.club.findUnique({
    where: { slug: params.slug },
    select: {
      id: true,
      name: true,
      slug: true,
      tagline: true,
      logoUrl: true,
      primaryColour: true,
      secondaryColour: true,
      backgroundColour: true,
      colorScheme: true,
      publishedAt: true,
    },
    cacheStrategy: { ttl: 60, swr: 300, tags: [`club_${params.slug.replace(/-/g, '_')}`] },
  });

  if (!club || !club.publishedAt) error(404, 'Hub not found');

  const tiers = await prisma.sponsorTier.findMany({
    where: { clubId: club.id },
    orderBy: { order: 'asc' },
    select: {
      id: true,
      name: true,
      businesses: {
        where: { isActive: true },
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          description: true,
          logoUrl: true,
          email: true,
          phone: true,
          websiteUrl: true,
        },
      },
    },
    cacheStrategy: { ttl: 60, swr: 300, tags: [`club_${params.slug.replace(/-/g, '_')}`] },
  });

  setHeaders({ 'cache-control': 'public, max-age=60, stale-while-revalidate=300' });

  return {
    club,
    tiers: tiers.filter((t) => t.businesses.length > 0),
  };
};
