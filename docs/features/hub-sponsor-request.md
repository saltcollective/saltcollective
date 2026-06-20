# Hub - Sponsor Request

**Status:** Draft
**Last updated:** 2026-06-20
**Owner:** Liam Egan
**Approver:** —
**Parent:** [Hub](hub.md)

---

## Summary

Today there is no way for a business to initiate a sponsorship from a hub — the Club Admin always adds businesses manually ([Add a Business](club-admin-add-business.md)). This feature lets a business owner express interest in sponsoring a club directly from the public hub page.

It ships in two phases. **Phase 1 (Expression of Interest)** captures the business's details as a *lead* and notifies the Club Admin, who completes the transaction off-platform and makes the business card live. **Phase 2 (Full Sponsorship Pipeline)** adds in-flow payment via Stripe Connect, admin approval, and automated payouts. Phase 1 is a strict subset of Phase 2 — nothing built in Phase 1 is discarded.

## Problem Statement

A local business owner who lands on a club's hub and wants to sponsor that club has no way to act on that intent. They have to find the club's contact details elsewhere and reach out cold. This loses warm leads at the moment of highest intent, and puts all the prospecting burden on the Club Admin.

We also do not yet know how strong the demand for self-initiated sponsorship is. Phase 1 is deliberately the cheapest way to test that assumption before committing to the legal, financial, and engineering cost of routing money (Phase 2).

## Goals

- Let a business express interest in sponsoring a club from the public hub, with no account required
- Notify the Club Admin immediately with all submitted details
- Reuse the existing `Business` record and admin edit flow — a lead is just a business in a pre-live state
- Test the core assumption (do businesses want to self-initiate?) before building payments
- Keep the data model forward-compatible with Phase 2

## Non-Goals (Phase 1)

- No payment collection, invoicing, or fund transfer — the club transacts off-platform
- No account creation or self-service editing for the business owner
- No automatic publication — a lead is never publicly visible until an admin activates it
- No approval/refund workflow (that arrives with Phase 2)

## User Stories

| As a... | I want to... | So that... |
|---------|-------------|------------|
| Business owner | Submit my details to sponsor a club without signing up | I can express interest with minimal friction |
| Business owner | Indicate my desired sponsorship level or spend | The club knows what I'm offering before they call me |
| Club Admin | Be notified by email when a business expresses interest | I can follow up while intent is high |
| Club Admin | Review a lead and make its card live once paid | Only paying sponsors appear on my hub |
| Club Admin | Edit a lead's details after submission | I can correct or complete the card the owner started |

---

## Phase 1 — Expression of Interest

### Functional Requirements

1. The public hub page (`(hub)/[slug]`) exposes a "Sponsor this club" entry point leading to a request form at `(hub)/[slug]/sponsor`.
2. The form is **unauthenticated** and collects:
   - Business name (required)
   - Business description (optional — shown on the hub once the lead is published)
   - Contact name (required)
   - Contact email (required)
   - Business phone (optional — the public number shown on the hub card)
   - Follow-up phone (optional — private number the club calls to confirm; never shown publicly)
   - Website URL (optional)
   - Desired sponsor tier (optional — chosen from the club's configured tiers)
   - Desired spend (optional)
   - Message / notes (optional)
   - Logo is **not** collected on the public form (the upload endpoint requires auth); the admin adds a logo when publishing the lead.
3. The form is protected against spam/abuse by reCAPTCHA (see [reCAPTCHA setup](#recaptcha-setup) below) plus a server-side honeypot field.
4. On submit, the server creates a `Business` record with `status = LEAD` scoped to the club, and records the desired tier/spend and message.
5. A lead is **never** returned by the public hub query — only `status = ACTIVE` businesses render publicly.
6. An email is sent to all `ADMIN` members of the club summarising the submission, with a deep link to the lead in the admin area.
7. The Club Admin can view leads in the existing sponsors list (filtered by status), edit them via the existing [Edit a Business](club-admin-edit-business.md) flow, and transition `LEAD → ACTIVE` (publish) or `LEAD → DECLINED`.
8. Rate limiting: a single client cannot submit more than a small number of requests per minute per club.

### Data Model Changes

The current `Business` model represents visibility with a single `isActive` boolean and requires `sponsorTierId`. Both need to change:

```prisma
enum BusinessStatus {
  LEAD       // submitted via sponsor request, awaiting admin action
  ACTIVE     // live on the hub
  DECLINED   // admin declined the lead
  ARCHIVED   // previously active, removed from the hub
}

model Business {
  // ... existing fields ...
  status            BusinessStatus @default(ACTIVE)  // replaces `isActive`
  sponsorTierId     String?        // now nullable — a lead has a *desired* tier
  description       String?        // now nullable — a lead may not provide one
  contactName       String?        // person who submitted the request
  confirmationPhone String?        // private follow-up number (not the public phone)
  desiredSpend      Decimal?       @db.Decimal(10, 2)
  message           String?        // free-text note from the requester
  source            String?        // "sponsor-request" vs "admin" — surfaced read-only on the edit screen
}
```

Migration notes:
- **Replace `isActive` with `status`** rather than keeping both — two overlapping visibility flags will cause bugs. Backfill: `isActive = true → ACTIVE`, `isActive = false → ARCHIVED`.
- Making `sponsorTierId` nullable is safe for existing rows. Public hub queries already filter by tier; ensure they tolerate null (leads aren't public anyway).
- Update the public hub query (`(hub)/[slug]/+page.server.ts`) and dashboard queries to filter on `status` instead of `isActive`.

### Routes & Components

- `(hub)/[slug]/sponsor/+page.svelte` — public request form (reuses `packages/ui` atoms: `Input`, `Label`, `Button`).
- `(hub)/[slug]/sponsor/+page.server.ts` — form action: verify reCAPTCHA → check honeypot → rate-limit → create `LEAD` `Business` → send admin email.
- Entry point on `(hub)/[slug]/+page.svelte` ("Sponsor this club").
- Admin: extend the sponsors list status filter to surface `LEAD`; add publish/decline actions.

### Email

Add `sendSponsorRequestEmail` to `apps/hub/src/lib/server/email.ts`, mirroring `sendInviteEmail` (same Resend client, same dark template). Recipients: all `ADMIN` members of the club. Content: business + contact details, desired tier/spend, message, and a deep link to the lead.

### Acceptance Criteria

- [ ] A visitor can open the sponsor request form from a published hub
- [ ] Required fields are enforced; at least one contact method is present
- [ ] Submitting with a failed/missing reCAPTCHA token is rejected server-side
- [ ] A successful submission creates a `Business` with `status = LEAD`
- [ ] The lead does **not** appear on the public hub
- [ ] All club `ADMIN`s receive a summary email with a working deep link
- [ ] An admin can edit the lead and transition it to `ACTIVE` (it then appears publicly) or `DECLINED`
- [ ] Repeated rapid submissions from one client are rate-limited

---

## Phase 2 — Full Sponsorship Pipeline (future)

Phase 2 adds in-flow payment on top of the Phase 1 foundation. The lead capture, business card, admin review, and activation steps all carry forward; Phase 2 adds the money layer and an approval gate.

### Recommendation: use Stripe Connect, not raw charges + manual payouts

The instinct that "there's no good seamless way to route a transaction through Salt's Stripe account and pay it out to the club" is true **only** for the charge-to-Salt-then-manually-transfer model — which is also the most legally fraught, because it can make Salt a money transmitter. The right primitive is **Stripe Connect**, which is purpose-built for a platform routing payments to many sub-merchants:

- **Clubs onboard as connected accounts** (Express recommended — Stripe hosts the KYC/onboarding UI). Store the connected account id on `Club` (alongside the existing `stripeCustomerId`).
- **A sponsor pays once; the split is automatic.** Use a destination charge (or direct charge with `application_fee_amount`): the club receives the sponsorship, Salt automatically retains a percentage as the application fee. This *is* the percentage-cut revenue model — no separate invoicing.
- **Payouts are automated by Stripe** on the connected account's schedule. This removes the "we'd need to batch transfers manually / build a robust payment system" burden, which only existed in the manual-payout model.
- **Salt's funds never commingle with club funds**, which materially reduces the regulatory surface compared to the route-through-Salt approach.

Trade-off to accept: Connect puts a one-time KYC onboarding step on each club (they provide business/identity details to Stripe). That is the real cost of Phase 2 — not "build payments from scratch."

### Flow

1. From the hub, the business owner enters the purchase flow, signs up (account now required for transaction records), and enters details.
2. They pay the relevant sponsorship level via Stripe Checkout / Payment Element. The charge splits via Connect (club destination + Salt application fee).
3. The `Business`/sponsorship is recorded as `PENDING_APPROVAL`; the Club Admin is emailed for approval.
4. On approval: status → `ACTIVE` (card goes live), payout proceeds via Stripe's schedule.
5. On rejection: refund the charge (Stripe handles the reversal, including the application fee) and email the business owner.

### Open Considerations (Phase 2)

| Question | Notes |
|----------|-------|
| Does the business owner get edit access to their card, or only the admin? | Owner edits likely need admin approval — scope carefully; this balloons quickly. |
| What is the approval SLA / what happens to held funds before approval? | Stripe doesn't support true holds at this level; the charge is captured immediately, so rejection means a refund. |
| Application fee percentage | Product/pricing decision; configurable per plan? |
| Legal | A lawyer is required once Salt is a payment platform — engage before launch, not after. |
| Tax / receipts | Who issues the receipt to the sponsor — Salt or the club? |

---

## Testing

### Phase 1

- **Email harness** — `deno task --tunnel email:test <to>` already exercises the Resend integration in isolation; extend or mirror it for `sendSponsorRequestEmail` once added.
- **Form validation** — required fields, contact-method presence, malformed email/URL rejected server-side (not just client-side).
- **reCAPTCHA** — submission with a missing/invalid/expired token is rejected; honeypot field, if filled, is rejected silently.
- **Visibility invariant** — a `LEAD` business is never returned by the public hub query; verify both the hosted page and the embed.
- **Scoping** — a submission to club A can never create a lead under club B (slug → clubId resolution is authoritative).
- **State transitions** — `LEAD → ACTIVE` makes the card public; `LEAD → DECLINED` does not; the existing edit flow works on leads.
- **Rate limiting** — rapid repeat submissions from one client are throttled.
- **Migration** — `isActive` backfill maps correctly (`true → ACTIVE`, `false → ARCHIVED`); no existing card changes visibility.

### Phase 2 (when built)

- Use **Stripe test mode** end to end: connected-account onboarding, destination charge with application fee, payout schedule, refund-on-rejection.
- Verify the application fee is correctly retained and reversed on refund.
- Webhook handling for async payment/payout/refund events.

## Open Questions

| Question | Answer |
|----------|--------|
| Should `status` fully replace `isActive`, or sit alongside it? | Recommend replace — see Data Model Changes. |
| reCAPTCHA v2 (checkbox) or v3 (invisible score)? | See reCAPTCHA setup below — recommend v3 with a score threshold, falling back to a challenge. |
| Should leads expire if unactioned? | TBD — could auto-archive after N days. |
| Can a business request to sponsor a hub that isn't published? | Recommend no — only published hubs expose the form. |

## Notes

- Phase 1 reuses: the `Business` model, the presigned S3 upload flow ([file storage](../infrastructure/file-storage.md)), the Resend email integration, and the existing edit-business admin flow.
- See [reCAPTCHA setup](#recaptcha-setup) — tracked separately as the anti-abuse dependency for the public form.

<a id="recaptcha-setup"></a>
## reCAPTCHA setup

See the dedicated walkthrough in [`docs/infrastructure/recaptcha.md`](../infrastructure/recaptcha.md).
