import { json, error } from '@sveltejs/kit';
import { prisma } from '@saltcollective/schema';
import type { RequestHandler } from './$types';

const VALID_TYPES = ['EMAIL', 'WEBSITE', 'PHONE'] as const;
type ClickType = (typeof VALID_TYPES)[number];

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json().catch(() => null);
  const { businessId, clubId, type } = body ?? {};

  if (!businessId || !clubId || !type) error(400, 'Missing required fields');
  if (!VALID_TYPES.includes(type)) error(400, 'Invalid type');

  const business = await prisma.business.findFirst({
    where: { id: businessId, clubId },
    select: { id: true },
  });
  if (!business) error(404, 'Not found');

  await prisma.clickEvent.create({
    data: { businessId, clubId, type: type as ClickType },
  });

  return json({ ok: true });
};
