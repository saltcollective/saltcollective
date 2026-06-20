import { error, fail } from '@sveltejs/kit';
import { prisma } from '@saltcollective/schema';
import { verifyRecaptcha } from '$lib/server/recaptcha';
import { sendSponsorRequestEmail } from '$lib/server/email';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const club = await prisma.club.findUnique({
    where: { slug: params.slug },
    select: {
      id: true,
      name: true,
      slug: true,
      logoUrl: true,
      primaryColour: true,
      secondaryColour: true,
      backgroundColour: true,
      colorScheme: true,
      publishedAt: true,
      sponsorTiers: { orderBy: { order: 'asc' }, select: { id: true, name: true } },
    },
  });

  if (!club || !club.publishedAt) error(404, 'Hub not found');

  const { sponsorTiers, publishedAt: _publishedAt, ...rest } = club;
  return { club: rest, tiers: sponsorTiers };
};

export const actions: Actions = {
  default: async ({ request, params, url, getClientAddress }) => {
    const fd = await request.formData();

    const businessName = (fd.get('businessName') as string)?.trim();
    const contactName = (fd.get('contactName') as string)?.trim();
    const email = (fd.get('email') as string)?.trim();
    const phone = (fd.get('phone') as string)?.trim() || null;
    const confirmationPhone = (fd.get('confirmationPhone') as string)?.trim() || null;
    const websiteUrl = (fd.get('websiteUrl') as string)?.trim() || null;
    const description = (fd.get('description') as string)?.trim() || null;
    const desiredTierId = (fd.get('desiredTierId') as string)?.trim() || null;
    const desiredSpendRaw = (fd.get('desiredSpend') as string)?.trim() || null;
    const message = (fd.get('message') as string)?.trim() || null;

    const values = {
      businessName,
      contactName,
      email,
      phone,
      confirmationPhone,
      websiteUrl,
      description,
      desiredTierId,
      message,
    };

    // Honeypot — a hidden field real users never fill. If populated, pretend
    // success so bots don't learn they were caught.
    if ((fd.get('company') as string)?.trim()) {
      return { success: true };
    }

    const check = await verifyRecaptcha(fd.get('recaptchaToken') as string | null, {
      expectedAction: 'sponsor_request',
      remoteIp: getClientAddress(),
    });
    if (!check.ok) {
      return fail(400, { error: 'Could not verify you are human. Please try again.', ...values });
    }

    if (!businessName) return fail(400, { error: 'Business name is required', ...values });
    if (!contactName) return fail(400, { error: 'Your name is required', ...values });
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return fail(400, { error: 'A valid email is required', ...values });
    }
    if (websiteUrl) {
      try {
        new URL(websiteUrl);
      } catch {
        return fail(400, { error: 'Website URL is not valid', ...values });
      }
    }
    let desiredSpend: number | null = null;
    if (desiredSpendRaw) {
      const n = Number(desiredSpendRaw.replace(/[^0-9.]/g, ''));
      if (!Number.isFinite(n) || n < 0) return fail(400, { error: 'Desired spend is not valid', ...values });
      desiredSpend = n;
    }

    const club = await prisma.club.findUnique({
      where: { slug: params.slug },
      select: { id: true, name: true, publishedAt: true },
    });
    if (!club || !club.publishedAt) error(404, 'Hub not found');

    // Best-effort flood guard: cap leads created per club per minute. Works
    // across isolates (DB-backed) since Deno Deploy has no shared memory.
    const oneMinuteAgo = new Date(Date.now() - 60_000);
    const recentLeads = await prisma.business.count({
      where: { clubId: club.id, status: 'LEAD', createdAt: { gte: oneMinuteAgo } },
    });
    if (recentLeads >= 5) {
      return fail(429, { error: 'Too many requests right now — please try again shortly.', ...values });
    }

    // A desired tier is optional; if provided it must belong to this club.
    let sponsorTierId: string | null = null;
    if (desiredTierId) {
      const tier = await prisma.sponsorTier.findFirst({
        where: { id: desiredTierId, clubId: club.id },
        select: { id: true },
      });
      sponsorTierId = tier?.id ?? null;
    }

    await prisma.business.create({
      data: {
        clubId: club.id,
        sponsorTierId,
        name: businessName,
        description,
        contactName,
        email,
        phone,
        confirmationPhone,
        websiteUrl,
        desiredSpend,
        message,
        status: 'LEAD',
        source: 'sponsor-request',
      },
    });

    // Notify all club ADMINs. Email failure must not fail the submission —
    // the lead is already saved.
    try {
      const admins = await prisma.clubMembership.findMany({
        where: { clubId: club.id, role: 'ADMIN' },
        select: { user: { select: { email: true } } },
      });
      const desiredTierName = sponsorTierId
        ? ((await prisma.sponsorTier.findUnique({ where: { id: sponsorTierId }, select: { name: true } }))?.name ?? null)
        : null;

      await sendSponsorRequestEmail({
        to: admins.map((a) => a.user.email),
        clubName: club.name,
        dashboardUrl: `${url.origin}/dashboard/sponsors?status=LEAD`,
        businessName,
        contactName,
        email,
        phone,
        confirmationPhone,
        websiteUrl,
        description,
        desiredTier: desiredTierName,
        desiredSpend: desiredSpend != null ? `$${desiredSpend.toLocaleString()}` : null,
        message,
      });
    } catch (e) {
      console.error('Sponsor request email failed:', e);
    }

    return { success: true };
  },
};
