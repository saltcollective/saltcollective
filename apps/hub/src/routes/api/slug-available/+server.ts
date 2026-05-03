import { json } from '@sveltejs/kit';
import { prisma } from '@saltcollective/schema';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
  const slug = url.searchParams.get('slug') ?? '';
  const excludeId = url.searchParams.get('excludeId') ?? '';
  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(slug) || slug.length < 2) {
    return json({ available: false });
  }
  const existing = await prisma.club.findUnique({ where: { slug }, select: { id: true } });
  return json({ available: !existing || existing.id === excludeId });
};
