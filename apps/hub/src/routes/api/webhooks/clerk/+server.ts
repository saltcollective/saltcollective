import type { RequestHandler } from './$types';
import { verifyWebhook } from 'svelte-clerk/webhooks';
import { prisma } from '@saltcollective/schema';

export const POST: RequestHandler = async ({ request }) => {
  let event;
  try {
    event = await verifyWebhook(request);
  } catch {
    return new Response('Invalid webhook signature', { status: 400 });
  }

  const userData = {
    username: event.data.username ?? null,
    email: event.data.email_addresses[0]?.email_address ?? '',
  };

  switch (event.type) {
    case 'user.created':
    case 'user.updated':
      await prisma.user.upsert({
        where: { clerkId: event.data.id },
        update: userData,
        create: { clerkId: event.data.id, ...userData },
      });
      break;

    case 'user.deleted':
      if (event.data.id) {
        await prisma.user.delete({ where: { clerkId: event.data.id } });
      }
      break;
  }

  return new Response(null, { status: 200 });
};
