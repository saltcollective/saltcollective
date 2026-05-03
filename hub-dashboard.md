# Hub Dashboard

## Status

**Mostly implemented (untested).** Dashboard screens built: overview, sponsors list, sponsors add/edit, tiers management, settings. Public hub page built. Not yet built: analytics, embed.

## Overview

The club admin interface lives at `/dashboard/*` inside the `(app)` route group. The `(app)` layout guards all child routes — unauthenticated users are redirected to `/sign-in`, users with no `ClubMembership` are redirected to `/onboarding/club`.

The layout passes `{ club, role }` down to every child page via `await parent()`. All Prisma queries must filter by `clubId: club.id`.

## Shell

**File:** `(app)/+layout.svelte`

- Desktop: 240px fixed sidebar + `1fr` main content area.
- Mobile (≤820px): sidebar collapses to a slide-in drawer. Sticky top bar shows club name + hamburger button. Dark scrim covers content when drawer is open.
- `Sidebar.svelte` takes `{ club, activeRoute, open, onClose }` props.
- Active nav item matched via exact string (`exact: true` on Dashboard) or `startsWith` prefix on sub-routes.

## Components

| Component | Location | Description |
|---|---|---|
| `Sidebar.svelte` | `apps/hub/src/lib/components/` | Nav (Dashboard → Settings), club mark in footer, mobile drawer |
| `PageHeader.svelte` | `apps/hub/src/lib/components/` | `{title}` + optional `{subtitle}` + optional `{#snippet action()}` |

## Screens

### Built

| Route | File | Notes |
|---|---|---|
| `/dashboard` | `dashboard/+page.svelte` + `+page.server.ts` | Four stat cards + recent sponsors list |
| `/dashboard/sponsors` | `dashboard/sponsors/+page.svelte` + `+page.server.ts` | Tier filter chips + business table; mobile reflows to card rows |

#### Dashboard overview (`/dashboard`)

Server loads:
- `business.count` (total, active → inactive derived)
- `clickEvent.count` filtered to current month start → `viewsThisMonth`
- `business.findMany` last 4 by `createdAt` → recent sponsors list

UI: `Stat` cards in a 4-column grid (2-col on ≤820px, 1-col on ≤420px). Recent sponsors card with name, tier, active/inactive badge.

#### Sponsors list (`/dashboard/sponsors`)

Server loads all businesses for the club ordered by tier then name. Also loads all tiers for the filter bar.

UI: Tier filter chips (client-side filter, no navigation). Business table: name + avatar initial, tier, status badge, Edit link to `/dashboard/sponsors/{id}/edit`.

Mobile reflow: table becomes grid card rows (name/tier/status/action in a 2-col grid).

### Not yet built

| Route | Purpose | Priority |
|---|---|---|
| `/dashboard/sponsors/new` | Add sponsor form | High |
| `/dashboard/sponsors/[id]/edit` | Edit sponsor form | High |
| `/dashboard/tiers` | Sponsor tier management | Medium |
| `/dashboard/analytics` | Click event reporting | Medium |
| `/dashboard/embed` | Embed code + public hub link | Low |
| `/dashboard/settings` | Club settings (name, slug, tagline, colours, logo, danger zone) | Medium |

## Screen specs (not yet built)

### Sponsors — New (`/dashboard/sponsors/new`)

**Fields:**
- **Name** (required) — max 120 chars
- **Tier** (required) — `<select>` populated from club's `SponsorTier` records
- **Description** (required) — textarea, max 500 chars
- **Email** (optional)
- **Phone** (optional)
- **Website URL** (optional) — validated as URL
- **Logo** (optional) — S3 presigned upload (same flow as onboarding branding). Accepts PNG/JPEG/SVG, max 2 MB. Shows preview.
- **Active** — boolean toggle, default `true`

**Server action (`?/create`):**
1. Validate required fields
2. `prisma.business.create({ data: { clubId, name, description, sponsorTierId, email, phone, websiteUrl, logoUrl, isActive } })`
3. `redirect(302, /dashboard/sponsors)`

Cancel link → `/dashboard/sponsors`.

### Sponsors — Edit (`/dashboard/sponsors/[id]/edit`)

Same fields as new. Server load fetches the business record (must belong to `club.id`). Action is `?/update` → `prisma.business.update`. Also includes a **Delete** action (`?/delete`) with a confirmation guard (check `clubId` matches before deleting).

After update/delete → `redirect(302, /dashboard/sponsors)`.

### Tiers (`/dashboard/tiers`)

Mirrors the onboarding tiers step UI but within the dashboard shell. Allows full CRUD on `SponsorTier` records after onboarding.

**UI:** Same dynamic list (name + price rows, reorder, add/remove). Requires at least one tier to submit.

**Constraint:** Deleting a tier that has associated businesses should either be blocked (show error) or prompt to reassign those businesses. Simplest: block deletion if `business.count > 0` for that tier, and display the count.

**Server action (`?/save`):** Same delete-and-recreate pattern as onboarding (safe because order can change). On delete-with-businesses error, return `{ tierInUse: true }`.

### Analytics (`/dashboard/analytics`)

Simple click event report — no charting library needed yet.

**Server load:** Query `clickEvent.groupBy({ by: ['businessId', 'type'] })` with counts. Join to business names. Filter to last 30 days by default.

**UI:**
- Date range selector (last 7 / 30 / 90 days) — client-side filter or server param.
- Table: business name, email clicks, website clicks, phone clicks, total.
- Total row at bottom.

### Embed (`/dashboard/embed`)

**UI:**
- Section: "Public hub URL" — `saltcollective.club/{slug}` displayed in a copy field + "View hub" link (opens in new tab).
- Section: "Embed code" — preformatted `<script>` snippet (placeholder for future embed widget). Copy button.
- Section: "Share" — just the URL again with a copy button.

No server actions required. All data from `club.slug` in layout data.

### Settings (`/dashboard/settings`)

**Sections:**
- **Club identity** — name, slug (with uniqueness check via `GET /api/slug-available`), tagline
- **Branding** — logo upload (S3), primary colour, secondary colour
- **Danger zone** — "Delete club" (destructive, requires typing club name to confirm)

**Guard:** `role !== 'ADMIN'` → `error(403)`.

**Server actions:** `?/updateIdentity`, `?/updateBranding`, `?/deleteClub`.

On `?/deleteClub`: delete all `Business`, `SponsorTier`, `ClubMembership`, `ClickEvent`, then `Club`. Redirect to `/onboarding/club` (user now has no membership).

## Public hub page

**Status: built (untested).** The public-facing sponsor hub page at `saltcollective.club/{slug}`.

**Route:** `apps/hub/src/routes/(hub)/[slug]/+page.svelte` (separate route group, no auth, no sidebar).

**Server load:**
1. `prisma.club.findUnique({ where: { slug, publishedAt: { not: null } } })` — 404 if not found or unpublished
2. Fetch tiers + businesses (active only, ordered by tier then name)
3. Return `{ club, tiers, businesses }`

**UI:**
- Club logo + name + tagline header (uses `club.primaryColour` / `secondaryColour` for accents)
- Tiers as section headings; businesses listed under each tier
- Each business card: logo/initial, name, description, website/email/phone links
- Clicking a link fires `POST /api/click` to log a `ClickEvent`

**Click tracking:** `POST /api/click` with `{ businessId, clubId, type: 'EMAIL' | 'WEBSITE' | 'PHONE' }`. No auth required. Server inserts `ClickEvent` record and returns `200`.

## Route files summary

```
apps/hub/src/routes/(app)/
  +layout.server.ts          auth + membership guard
  +layout.svelte             sidebar shell
  dashboard/
    +page.svelte             stats + recent sponsors     ✓ built
    +page.server.ts                                      ✓ built
    sponsors/
      +page.svelte           sponsor list               ✓ built
      +page.server.ts                                   ✓ built
      new/
        +page.svelte         add sponsor form           ✓ built
        +page.server.ts                                 ✓ built
      [id]/
        edit/
          +page.svelte       edit sponsor form          ✓ built
          +page.server.ts                               ✓ built
    tiers/
      +page.svelte           tier management            ✓ built
      +page.server.ts                                   ✓ built
    analytics/
      +page.svelte           click report               ✗ not built
      +page.server.ts                                   ✗ not built
    embed/
      +page.svelte           embed + share              ✗ not built
    settings/
      +page.svelte           club settings              ✓ built
      +page.server.ts                                   ✓ built

apps/hub/src/routes/(hub)/
  +layout.svelte             minimal wrapper            ✓ built
  [slug]/
    +page.svelte             public hub page            ✓ built
    +page.server.ts                                     ✓ built

apps/hub/src/routes/api/
  click/
    +server.ts               click tracking endpoint    ✓ built
```

## Data model reference

**Business:** `id`, `clubId`, `sponsorTierId`, `name`, `description`, `logoUrl?`, `phone?`, `email?`, `websiteUrl?`, `isActive`, `createdAt`

**SponsorTier:** `id`, `clubId`, `name`, `order`, `price?`

**ClickEvent:** `id`, `businessId`, `clubId`, `type` (`EMAIL` | `WEBSITE` | `PHONE`), `createdAt`

**Club:** `id`, `name`, `slug`, `tagline?`, `logoUrl?`, `primaryColour?`, `secondaryColour?`, `publishedAt?`

## To-do

### Dashboard screens
- [x] `dashboard/sponsors/new` — add sponsor form
- [x] `dashboard/sponsors/[id]/edit` — edit sponsor form (with delete action)
- [x] `dashboard/tiers` — tier management (block delete if tier has businesses)
- [ ] `dashboard/analytics` — click event report (last 7/30/90 days)
- [ ] `dashboard/embed` — embed + public hub URL
- [x] `dashboard/settings` — identity, branding, danger zone (ADMIN only)

### Public hub
- [x] `(hub)/[slug]/+page.svelte` + `+page.server.ts` — public club hub page
- [x] `api/click/+server.ts` — click tracking endpoint (no auth, POST)

### Testing
- [ ] Full end-to-end flow: sign up → onboarding → dashboard → add sponsor/tier → view hub page

### Admin section
- [ ] Test the `/admin/*` screens end-to-end (built in prior session, never verified)
