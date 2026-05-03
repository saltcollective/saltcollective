# Club Onboarding Flow

## Status

**Implementation complete (untested).** All route files exist and are wired up. See to-do list at the bottom for known gaps.

## Overview

Multi-step wizard that takes a newly signed-up user from a blank account to a live, functioning club hub page. The flow lives at `/onboarding/*` — outside the `(app)` route group so it has its own shell (no sidebar).

Entry point: Clerk sends new sign-ups directly to `/onboarding/club` via `afterSignUpUrl`. The `(app)` layout also redirects users with no `ClubMembership` to `/onboarding/club`.

## Steps

| # | Route | Action | Skippable |
|---|---|---|---|
| 1 | `/onboarding/club` | Club identity — name, slug, tagline | No |
| 2 | `/onboarding/branding` | Logo upload + brand colours | Yes |
| 3 | `/onboarding/tiers` | Sponsor tier setup | Yes |
| 4 | `/onboarding/payment` | Subscription plan (Stripe stub) | Yes (forced for now) |
| 5 | `/onboarding/done` | Publishes club, redirects to dashboard | — |

## State passing between steps

Step 1 creates the `Club` and `ClubMembership` (ADMIN role) then redirects to:

```
/onboarding/branding?club=<clubId>
```

Each subsequent step reads `url.searchParams.get('club')`, verifies the user holds an ADMIN `ClubMembership` for that club, and passes it forward in skip/continue links.

The `club` param is not secret — it's just a cuid. Security comes from the membership check, not URL obscurity.

## Guard logic

### Onboarding layout server (`onboarding/+layout.server.ts`)
- Not authenticated → `redirect(302, '/sign-in')`
- Authenticated, already has a published club membership → `redirect(302, '/dashboard')`
- Otherwise → allow through

"Published" = `club.publishedAt !== null`. A user mid-onboarding has a membership but their club is unpublished, so they pass through correctly.

### Step 1 (`club/+page.server.ts`)
- If user already has a ClubMembership → `redirect(302, '/dashboard')`

### Steps 2–4 (`branding`, `tiers`, `payment`)
- `club` param missing or membership not found → `redirect(302, '/onboarding/club')`

### Done step (`done/+page.server.ts`)
- Same membership check as steps 2–4
- Sets `Club.publishedAt = new Date()` if not already set
- Redirects to `/dashboard`

## Route files

```
apps/hub/src/routes/onboarding/
  +layout.server.ts       auth + published-club guard
  +layout.svelte          centred card shell, step progress indicator
  +page.server.ts         redirect → /onboarding/club
  club/
    +page.svelte          name / slug / tagline form
    +page.server.ts       create action → Club + ClubMembership(ADMIN)
  branding/
    +page.svelte          logo upload + colour pickers
    +page.server.ts       update action → Club.logoUrl, primaryColour, secondaryColour
  tiers/
    +page.svelte          add up to 5 tiers (name + optional price)
    +page.server.ts       create action → SponsorTier[]
  payment/
    +page.svelte          pricing card + disabled "Subscribe" + "Skip for now"
    +page.server.ts       (stub — no Stripe yet; skip goes to /onboarding/done)
  done/
    +page.svelte          success message + "Go to your hub" button
    +page.server.ts       set Club.publishedAt, redirect → /dashboard
```

## Layout shell

Centred single-column card, max-width ~520px, vertically centred on the viewport.

Top of the card: step progress indicator — 5 dots or a segmented bar, current step highlighted. Step labels shown on ≥480px.

No sidebar. Brand logo at top of page (outside card). Dark/light aware via `BrandLogo.svelte`.

## Step 1 — Club details

**Fields:**
- **Club name** (required) — plain text, max 80 chars
- **Slug** (required) — auto-derived from name (lowercase, hyphens, stripped punctuation), editable inline. Validated unique on blur via a lightweight endpoint or deferred until submit. Shown as `saltcollective.club/{slug}`
- **Tagline** (optional) — max 160 chars, shown under the club name on the public hub

**Server action (`?/create`):**
1. Validate name + slug (required, slug unique)
2. `prisma.club.create({ data: { name, slug, tagline } })`
3. `prisma.clubMembership.create({ data: { userId, clubId, role: 'ADMIN' } })`
4. `redirect(302, /onboarding/branding?club=${club.id})`

**Slug uniqueness check endpoint:** `GET /api/slug-available?slug=xxx` — returns `{ available: boolean }`. Used client-side on blur for inline feedback.

## Step 2 — Branding

**Fields:**
- **Logo** (optional) — image upload. Uses the existing presigned S3 upload flow (`POST /api/upload`). Shows a preview after upload. Accepts PNG/JPEG/SVG, max 2 MB.
- **Primary colour** (optional) — colour picker + hex input, default `#68b7d2`
- **Secondary colour** (optional) — colour picker + hex input, default `#f4a27e`

**Server action (`?/update`):**
1. `prisma.club.update({ where: { id }, data: { logoUrl, primaryColour, secondaryColour } })`
2. `redirect(302, /onboarding/tiers?club=${clubId})`

Skip link: `/onboarding/tiers?club=${clubId}` (no server action).

## Step 3 — Sponsor tiers

Prompt: "Set up the tiers you offer to sponsors — e.g. Gold, Silver, Bronze."

**UI:** A dynamic list of tier rows. Each row: name input + optional price input. Add up to 5 tiers with an "Add tier" button. Rows can be reordered (drag or up/down buttons) — `order` field on `SponsorTier` tracks this.

Default pre-populated rows (deletable): Gold, Silver, Bronze.

**Server action (`?/create`):**
1. Delete any existing `SponsorTier` records for the club (safe to recreate on re-entry)
2. `prisma.sponsorTier.createMany({ data: tiers.map((t, i) => ({ clubId, name: t.name, order: i, price: t.price ?? null })) })`
3. `redirect(302, /onboarding/payment?club=${clubId})`

Skip link: `/onboarding/payment?club=${clubId}`.

## Step 4 — Payment

**UI:**
- Brief copy: "Choose a plan to keep your hub running."
- Single pricing card: **Hub** — $49/year or $5/month.
- "Start subscription" button — disabled, shows tooltip "Coming soon — you'll be able to subscribe once Stripe is connected."
- Discount code section below the pricing card: text input + "Apply" button. On submit, server validates the code. If valid, code is marked redeemed and user is redirected to `/onboarding/done?club=${clubId}`. If invalid or already redeemed, inline error is shown.
- "Skip for now — I'll set this up later" link → `/onboarding/done?club=${clubId}`

**Server action (`?/applyCode`):**
1. Read `code` (uppercased) and `clubId` from form data
2. Verify user holds ADMIN membership for the club
3. Look up `DiscountCode` where `code` matches, `redeemedByClubId` is null, and `expiresAt` is null or in the future
4. If not found → `fail(400, { error: 'Invalid or already used discount code' })`
5. `prisma.discountCode.update({ where: { id }, data: { redeemedByClubId: clubId, redeemedAt: new Date() } })`
6. `redirect(302, /onboarding/done?club=${clubId})`

> **Note:** Requires the `DiscountCode` model to be added to the schema and the `/admin/discount-codes` management screen to be built first. See [`docs/features/site-admin-discount-codes.md`](docs/features/site-admin-discount-codes.md).

## Step 5 — Done

**Server load:**
1. Verify membership (see guard logic above)
2. `prisma.club.update({ where: { id: clubId }, data: { publishedAt: new Date() } })` (idempotent — only sets if null)
3. Return `{ clubName, slug }` for the page to display

**UI:**
- "Your hub is live." heading
- Club name shown
- Public hub URL shown: `saltcollective.club/{slug}` (copyable)
- "Go to your hub" button → `/dashboard`

No skip. This step is reached by navigating here; the server action runs in `load`.

## `(app)` layout change

Update `apps/hub/src/routes/(app)/+layout.server.ts`:

```typescript
// Before:
if (!membership) redirect(302, '/');

// After:
if (!membership) redirect(302, '/onboarding/club');
```

## Slug availability API

`apps/hub/src/routes/api/slug-available/+server.ts`

```typescript
GET /api/slug-available?slug=xxx
→ 200 { available: boolean }
```

Checks `prisma.club.findUnique({ where: { slug } })`. No auth required (slugs are public).

## Schema

No schema changes required. All fields used (`Club.publishedAt`, `Club.logoUrl`, `Club.primaryColour`, `Club.secondaryColour`, `Club.tagline`, `Club.slug`, `SponsorTier.order`, `SponsorTier.price`) already exist.

## Route restructure

All `(app)` pages live under `/dashboard/*`:

| URL | File |
|---|---|
| `/dashboard` | `(app)/dashboard/+page.svelte` |
| `/dashboard/sponsors` | `(app)/dashboard/sponsors/+page.svelte` |
| `/dashboard/tiers` | `(app)/dashboard/tiers/` _(not yet built)_ |
| `/dashboard/analytics` | `(app)/dashboard/analytics/` _(not yet built)_ |
| `/dashboard/embed` | `(app)/dashboard/embed/` _(not yet built)_ |
| `/dashboard/settings` | `(app)/dashboard/settings/` _(not yet built)_ |

The `Sidebar.svelte` nav items reflect these paths. The Dashboard item uses `exact: true` matching so it only highlights at `/dashboard`, not on sub-routes.

## To-do

### Onboarding
- [ ] Test the full flow end-to-end with `deno task --tunnel dev`
- [ ] Wire up real-time slug availability check on blur using `GET /api/slug-available` (currently only checked on submit)
- [ ] Add a "resume onboarding" banner in the `(app)` dashboard for users who skipped to `/dashboard` before completing all steps (detect via missing tiers, missing branding, or unpublished club — though `publishedAt` is set at the done step so skipping to `/dashboard` isn't possible without going through `/onboarding/done`)
- [ ] Stripe integration — replace the disabled payment step with a real Stripe Checkout or subscription flow

### `(app)` dashboard screens not yet built
- [ ] `dashboard/sponsors/new` — add sponsor form
- [ ] `dashboard/sponsors/[id]/edit` — edit sponsor form
- [ ] `dashboard/tiers` — sponsor tier management
- [ ] `dashboard/analytics` — click event reporting
- [ ] `dashboard/embed` — embed code + shareable public hub link
- [ ] `dashboard/settings` — club settings (name, slug, tagline, colours, logo, danger zone)
