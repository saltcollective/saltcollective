# Salt Collective Club Hub

## Overview

Deno monorepo for the Salt Collective club hub application.

## Workspace Structure

```
/
├── apps/
│   └── hub/               # SvelteKit app → Deno Deploy
├── packages/
│   ├── ui/                # Bits UI component library with CSS modules
│   ├── schema/            # Prisma schema, generated client, shared types
│   └── config/            # Shared TS, Prettier, ESLint/Biome configs
├── docs/                  # Pure markdown documentation (no build step)
├── deno.json              # Root workspace config + shared tasks
└── CLAUDE.md
```

Root `deno.json` declares workspaces and Deno-level lint/fmt rules. Each workspace has its own `deno.json` with a `"name"` field enabling cross-workspace imports by package name (e.g. `@saltcollective/ui`, `@saltcollective/schema`).

## Tech Stack

| Concern      | Choice                                                 |
| ------------ | ------------------------------------------------------ |
| Runtime      | Deno                                                   |
| Deployment   | Deno Deploy via `@sveltejs/adapter-auto`               |
| Framework    | SvelteKit                                              |
| Components   | Bits UI (headless) + CSS modules                       |
| Auth         | Clerk via `clerk-sveltekit`                            |
| Database     | Prisma Postgres (Prisma's managed serverless Postgres) |
| ORM          | Prisma with Accelerate extension (edge-compatible)     |
| File storage | AWS S3                                                 |
| CDN          | AWS CloudFront (serves S3 assets)                      |
| Styling      | CSS modules — **no Tailwind**                          |

## Key Conventions

### Components (`packages/ui`)

- Bits UI provides headless, accessible primitives (used selectively — see below)
- All styling via **Svelte's built-in scoped CSS** — use plain `<style>` blocks (not `<style module>`). Svelte 5 reserves `$`-prefixed identifiers for runes; `$style` from vite-plugin-svelte CSS modules is not compatible.
- Use plain string class names in templates: `class="button {variant} {size}"`. Svelte scopes all selectors defined in `<style>` to the component automatically.
- **Do not pass parent-scoped classes to child components** — Svelte's scope hash doesn't cross component boundaries via the `class` prop. Instead, wrap with a div in the parent template (children rendered via snippets retain the parent's scope).
- Components use **native HTML elements** directly in their templates (not wrapped components) so that Svelte's scoping applies correctly. Bits UI is used for complex headless primitives (Accordion, Dialog, etc.), not for simple elements like button/label.
- Components must be **generic and schema-agnostic**
- Database-aware wrappers or adapters that bind to schema shapes live in `apps/hub`, not `packages/ui`
- **As new pages are built in `apps/hub`, extract reusable UI into `packages/ui` as part of that work** — don't defer it

#### Design tokens

CSS custom properties defined in `packages/ui/src/tokens.css`, imported once in the root `+layout.svelte`. All component styles reference these variables — no hardcoded values.

Dark theme is the default (`:root`). Light theme activates automatically via `@media (prefers-color-scheme: light)` — no JavaScript, no class toggling.

Static assets (`apps/hub/static/`):

- `fonts/InterVariable.woff2` — Inter variable font, preloaded in `app.html`
- Brand logos are served from CloudFront: `https://d2hxbdf4sjiujo.cloudfront.net/static/logo-dark.svg` and `logo-light.svg`. Use `BrandLogo.svelte` — it selects the correct variant via `<picture>` + `prefers-color-scheme`.

#### Layout system

- `Container.svelte` — max-width 1200px, centered, with horizontal padding. Use as a section wrapper.
- `Grid.svelte` — CSS Grid primitive. For responsive layouts, define grid rules in each page/component's own `<style>` block.
- Route group layouts (`(marketing)/+layout.svelte`, `(app)/+layout.svelte`) define page shells — nav, footer, sidebars.

#### Current atoms (`packages/ui/src/lib/`)

| Component          | Description                                                                                                                                                                                     |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BrandLogo.svelte` | `<picture>` element serving CloudFront SVGs, switching dark/light via `prefers-color-scheme`. Prop: `height` (px).                                                                              |
| `Button.svelte`    | Native `button`/`a` element. Props: `variant` (`primary`\|`secondary`\|`ghost`\|`destructive`), `size` (`sm`\|`md`\|`lg`), `href` (renders anchor), `disabled`. All other attrs spread through. |
| `Label.svelte`     | Native `label`. Prop: `required` (adds asterisk via CSS `::after`). Pass `for` via spread.                                                                                                      |
| `Input.svelte`     | Compound input — optional `label` string renders a `Label` above, optional `error` string renders message below with red border. `value` is `$bindable`.                                        |
| `Badge.svelte`     | Pure CSS status chip. Prop: `variant` (`default`\|`success`\|`warning`\|`destructive`).                                                                                                         |
| `Stat.svelte`      | Stat card — eyebrow label + large numeric value. Props: `label`, `value`.                                                                                                                       |
| `Grid.svelte`      | CSS Grid layout primitive. Props: `cols` (number → `repeat(n,1fr)` or raw CSS string), `gap`, `rowGap`, `colGap`, `as` (polymorphic element tag).                                               |
| `Container.svelte` | Max-width 1200px centered container. Props: `as` (element tag), `class`.                                                                                                                        |

#### Export conventions

`packages/ui/src/index.ts` exports custom components by name (`Button`, `Label`, `Container`, etc.), which intentionally shadow the bits-ui primitives of the same name. Raw bits-ui namespaces are re-exported as `BitsButton` and `BitsLabel` for direct primitive access. All other bits-ui components (`Accordion`, `Dialog`, `Tabs`, etc.) are re-exported unchanged.

### Schema (`packages/schema`)

- Contains `prisma/schema.prisma` as the single source of truth for data shapes
- Prisma client is generated here and consumed by `apps/hub`
- Use `prisma generate --no-engine` — the standard query engine binary does not work in Deno/edge; Prisma Postgres connects via HTTP through Prisma Accelerate
- Add `@prisma/extension-accelerate` to the Prisma client instantiation
- Export shared TypeScript types alongside the generated client
- **There is no local database** — all DB operations connect to Prisma Postgres

### Config (`packages/config`)

- `tsconfig.base.json` — base TypeScript config extended by all workspaces
- `tsconfig.svelte.json` — TypeScript config for Svelte projects
- Prettier config + `prettier-plugin-svelte` (Deno fmt does not handle `.svelte` files — use Prettier for all formatting)
- ESLint config with `svelte-eslint-parser` for Svelte files (or Biome if adopted later)
- Deno-level lint/fmt rules belong in root `deno.json`, not in this package

### Documentation (`docs/`)

- Pure markdown only — no framework, no build step
- Human-readable source; no tooling assumptions

## Database Environment Variables

Two separate env vars are required — Deno Deploy automatically injects `DATABASE_URL` as the direct PostgreSQL connection string and this cannot be overridden:

| Variable       | Value                                                                                                | Used by                                                                                 |
| -------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `DATABASE_URL` | `postgresql://...` — set automatically by Deno Deploy                                                | Prisma migrations (`db:migrate`), also used as `directUrl` in `schema.prisma`           |
| `PRISMA_URL`   | `prisma+postgres://...` — Prisma Accelerate connection string, set manually in Deno Deploy dashboard | App at runtime (`packages/schema/src/index.ts` reads this via `process.env.PRISMA_URL`) |

The schema reflects this split:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("PRISMA_URL")    // Accelerate — used by the app
  directUrl = env("DATABASE_URL")  // Direct Postgres — used by migrations
}
```

`PRISMA_URL` must be set manually in the Deno Deploy dashboard. It is injected locally via `--tunnel` alongside `DATABASE_URL`.

## Database Scripts

Defined in `packages/schema/deno.json`. All operations connect to Prisma Postgres remotely — there is no local DB to spin up.

```json
{
  "tasks": {
    "db:generate": "deno run -A npm:prisma generate",
    "db:push": "deno run -A npm:prisma db push",
    "db:migrate": "deno run -A npm:prisma migrate dev",
    "db:migrate:reset": "deno run -A npm:prisma migrate reset",
    "db:migrate:deploy": "deno run -A npm:prisma migrate deploy",
    "db:studio": "deno run --tunnel -A npm:prisma studio"
  }
}
```

Local DB operations require the `--tunnel` flag to inject environment variables. The canonical change workflow is **edit model → `deno task --tunnel db:migrate` → commit migration → push → CD runs `db:migrate:deploy`** (see [Database change workflow](#database-change-workflow-canonical)). `db:migrate:deploy` runs in CD without `--tunnel` (Deno Deploy injects the env). `db:push` skips migration files and causes history drift — only for a throwaway/fresh dev environment where data loss is acceptable, never in the normal workflow.

## Adapter Note

`@sveltejs/adapter-auto` is used. Deno Deploy is not in adapter-auto's platform detection list — it will fall back to `adapter-node`, which runs via Deno's Node.js compatibility mode. If platform-specific issues arise at deploy time, the escape hatch is switching to `@sveltejs/adapter-deno`.

## File Storage (`apps/hub`)

User-uploaded files (club logos, business logos) and static site assets are stored in AWS S3 (`saltcollective-uploads`, `ap-southeast-2`) and served via CloudFront (`d2hxbdf4sjiujo.cloudfront.net`).

The server never handles file bytes directly. The upload flow:

1. Client POSTs to `POST /api/upload` with `{ contentType, folder, id }`
2. Server returns `{ uploadUrl, publicUrl }` — a presigned S3 PUT URL and the final CloudFront URL
3. Client PUTs the file directly to S3 via the presigned URL
4. Client saves the `publicUrl` to the relevant record (`Club.logoUrl` or `Business.logoUrl`)

S3 utility: `apps/hub/src/lib/server/s3.ts`. Upload endpoint: `apps/hub/src/routes/api/upload/+server.ts`.

Key structure:

- `clubs/{clubId}/{timestamp}.{ext}` — club logos
- `businesses/{businessId}/{timestamp}.{ext}` — business logos
- `static/` — manually uploaded non-code static content

All AWS env vars (`AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET`, `AWS_CLOUDFRONT_DOMAIN`) are set in the Deno Deploy dashboard. See `docs/infrastructure/file-storage.md` for full details.

## Site Domain

The public-facing domain is env-controlled so testing/UAT/production can differ: `PUBLIC_SITE_DOMAIN` (e.g. `saltcollective.com`, no protocol), set in the Deno Deploy dashboard per environment, falling back to `saltcollective.com` when unset. `apps/hub/src/lib/domain.ts` is the single source — it exports `siteDomain`, `siteUrl`, and `clubUrl(slug)`. Anywhere a hub/site URL is displayed or embedded (admin lists, embed page, marketing copy, email footers) must use these helpers — never hardcode the domain. In-app navigation links stay relative (`/{slug}`). The Resend `FROM` address in `email.ts` is intentionally not env-controlled — it's tied to the verified sending domain.

## Hub Admin App (`apps/hub/src/routes/(app)/`)

Post-auth club admin interface. The `(app)` route group provides the hub shell — sidebar + main — and guards all child routes.

### Access control

The `(app)` group is restricted to authenticated users who have at least one `ClubMembership`. The layout server enforces this and passes `{ club, role }` down to every child page.

**Who can access:**

- Any user with a `ClubMembership` (`ADMIN` or `EDITOR` role)
- `UserType.SITE_ADMIN` users (platform-level admins) — not yet explicitly handled; currently they must also have a `ClubMembership` to enter the hub

**`ClubRole` permissions (convention, not yet fully enforced in code):**

- `ADMIN` — full access: sponsors, tiers, analytics, embed, settings
- `EDITOR` — can add/edit businesses; should not access tiers or settings screens

Role-based guards are enforced on `tiers`, `team` and `settings` — both in `load` (via `parent()` role) and in every form action (via a scoped `clubMembership.findFirst({ role: 'ADMIN' })`, since actions can't rely on the layout). The `(app)` layout also hides ADMIN-only nav items from EDITORs. When adding a restricted screen, follow the same pattern:

```typescript
// In a page's +page.server.ts
const { role } = await parent();
if (role !== 'ADMIN') error(403, 'Admin access required');
```

### Data scoping

Every page load calls `await parent()` to get `{ club, role }` from the layout server. **All Prisma queries in `(app)` pages must filter by `clubId: club.id`** — never query across clubs. The layout guarantees the club belongs to the signed-in user.

### Shell

- `(app)/+layout.server.ts` — redirects unauthenticated users to `/sign-in`; redirects users with no `ClubMembership` to `/onboarding/club`; passes `{ club, role }` to all child pages
- `(app)/+layout.svelte` — 240px sidebar + 1fr main on desktop; collapses to a sticky mobile bar + slide-in drawer on ≤820px

### Hub-specific components (`apps/hub/src/lib/components/`)

These are hub-specific and do not belong in `packages/ui`:

| Component           | Description                                                                                                |
| ------------------- | ---------------------------------------------------------------------------------------------------------- |
| `PageHeader.svelte` | Page title + optional subtitle + optional `{#snippet action()}` slot. Used at the top of every hub screen. |

The sidebar itself is `AppSidebar` from `@saltcollective/ui`, configured with nav sections inline in `(app)/+layout.svelte` (ADMIN-only items filtered by `data.role`).

Full spec (current state, screen designs, to-do list): [`hub-dashboard.md`](hub-dashboard.md).

### Screens built

All dashboard screens are built:

- `dashboard/` — four `Stat` cards (total, active, inactive, views this month) + recent sponsors list
- `dashboard/sponsors/` — tier filter chips + business table; reflowed to card rows on mobile
- `dashboard/sponsors/new` + `dashboard/sponsors/[id]/edit` — full sponsor CRUD with logo upload
- `dashboard/tiers/` — create, reorder, delete with sponsor count guards
- `dashboard/analytics/` — stats summary + pure-SVG clicks-over-time bar chart
- `dashboard/embed/` — embed code + shareable public hub link
- `dashboard/settings/` — name, slug, tagline, colours, logo, danger zone (ADMIN-guarded)
- `dashboard/team/` — members, role management, invites (send / resend / revoke) (ADMIN-guarded)

### Public hub page

- `(hub)/[slug]/` — public-facing sponsor listing with tier filtering, search, click tracking
- `(hub)/[slug]/sponsor/` — sponsorship request form; emails club admins

### Site admin (`/admin/*`)

Restricted to `UserType.SITE_ADMIN`. Dashboard, clubs, users, analytics, billing, discount-codes screens exist — clubs and users are currently **read-only lists** (see Roadmap).

## Onboarding (`apps/hub/src/routes/onboarding/`)

Multi-step wizard taking a new user from sign-up to a live club hub. Full spec: [`onboarding.md`](onboarding.md).

**Route:** `/onboarding/*` — 5 steps: club details → branding → tiers → payment (stub) → done.

**Status:** Implementation complete; verified end-to-end 2026-07-19.

**Key behaviour:**

- Step 1 creates `Club` + `ClubMembership(ADMIN)`. Steps 2–4 update via `?club=<clubId>` URL param.
- Done step sets `Club.publishedAt` — the club goes live immediately.
- `(app)` layout redirects users with no membership to `/onboarding/club` (not `/`).
- Onboarding layout redirects users who already have a published club to `/dashboard`.
- Slug uniqueness checked via `GET /api/slug-available?slug=xxx`.

## Auth

Clerk via `svelte-clerk`. All auth logic lives in `apps/hub`. No auth-specific components belong in `packages/ui`.

- Sign-in page: `apps/hub/src/routes/sign-in/[...catchall]/+page.svelte`
- Sign-up page: `apps/hub/src/routes/sign-up/[...catchall]/+page.svelte`
- Sign-in/sign-up URLs are configured on `<ClerkProvider>` in the root `+layout.svelte`
- `locals.user` is populated by `hooks.server.ts` for every authenticated request — use this for auth checks in server routes and load functions

## Known performance issue — sequential DB round-trips

Every `(app)` page server calls `await parent()` to get `club.id`, which means page queries cannot start until the layout's `clubMembership.findFirst` completes. This causes two sequential Prisma Accelerate round-trips on every dashboard page load.

**To fix:** refactor high-traffic page servers (starting with `dashboard/+page.server.ts` and `dashboard/sponsors/+page.server.ts`) to do their own scoped membership lookup in parallel with their data queries, rather than blocking on `parent()`. The layout can keep its own lookup for the shell — the duplication is cheaper than the sequential wait.

Monitor first; only invest in this if page load times remain noticeable after Prisma plan upgrade.

## Streaming / deferred data (pending Deno Deploy upgrade)

SvelteKit supports returning unawaited `Promise`s from `load` functions so the page renders immediately and slow data streams in, handled client-side with `{#await}`. This requires Deno Deploy Pro or above for chunked streaming responses.

**Once the Deno Deploy plan is upgraded:** apply streaming to the dashboard overview (stream recent sponsors list, render stat card shells immediately) and the sponsors list (stream table rows). The public hub page tier grids are also a good candidate. Pattern: await only the minimum data needed to render the page shell; return everything else as an unawaited promise.

## Deno Deploy Constraints

- No filesystem access at runtime
- No direct TCP database connections — Prisma Postgres uses HTTP via Accelerate, which works here
- No persistent in-memory state between requests
- npm packages that rely on native Node bindings will not work
- **Environment variables come from the Deno Deploy dashboard, injected locally via `--tunnel`. Do not create `.env` files.**

## Development

```sh
# Start dev server (env vars injected via Deno Deploy tunnel)
deno task --tunnel dev

# Reset dev DB and re-run all migrations from scratch (fixes drift, wipes all data)
deno task --tunnel db:migrate:reset
```

### Database change workflow (canonical)

This is the standard process for **every** schema change — always create a migration file; do not use `db:push` for normal work.

1. **Edit the model** in `packages/schema/prisma/schema.prisma`.
2. **Create + apply the migration on dev:**
   ```sh
   deno task --tunnel db:migrate
   ```
   Prisma diffs the schema against the last migration, prompts for a migration name, writes the SQL file under `packages/schema/prisma/migrations/`, and applies it to the dev database. The `--tunnel` flag injects `DATABASE_URL`/`PRISMA_URL`.
3. **Commit the migration file** alongside the schema change and **push to `main`**.
4. **CD deploys it.** The deploy hook runs `prisma generate`, then `deno task db:migrate:deploy` (`prisma migrate deploy`) applies any pending migration files to production. No `--tunnel` in CD — Deno Deploy injects the env automatically.

`db:push` skips migration files and causes migration-history drift — only use it for a throwaway/fresh dev environment where data loss is acceptable, never as part of the normal workflow. A migration file must exist in the repo before pushing a schema change, or the deploy will not apply it.

## Roadmap

Last audited 2026-07-18. All screens exist; remaining work is depth, verification, and stubs.

### Priority — functional gaps

1. **Admin user management** — `/admin/users` is a read-only list. Needs actions: change `UserType`, suspend/delete.
2. **Impersonation** — no way for a SITE_ADMIN to view/operate a club's hub as that club. Needed for support. Design carefully (audit trail, clear "impersonating" banner, scoped session). The schema already has an `ImpersonationLog` model to build on.
3. **Admin club detail view** — `/admin/clubs` now has suspend/delete actions but no per-club detail screen (members, sponsors, activity at a glance).
4. **Audit/lifecycle tracking for clubs and users** — a table (or tables) tracking key lifecycle dates per club and per user: last active, paid until, last deactivation/suspension, etc. Surfaced in the admin club detail view and `/admin/users`. Design note: decide between denormalised timestamp columns on `Club`/`User` (cheap to query, good for "paid until") vs an append-only audit-event table (full history, good for "who suspended this and when") — likely both: columns for current state, events for history. Ties into Stripe (paid until) and impersonation (`ImpersonationLog` is a special case of the same idea).
5. **Multi-club administration** — the schema already allows a user to hold multiple `ClubMembership`s, but the app assumes one: `(app)/+layout.server.ts` picks the first membership (`findFirst`) and there is no way to switch clubs. Needs a club switcher in the hub shell, a persisted "active club" (cookie or URL), and an audit of every `(app)` page + form action that resolves the club via `findFirst` so they scope to the active club instead. Onboarding also blocks users with an existing published club from creating another.

### Verification

All manually verified by Liam on 2026-07-19 (dev server, step-by-step walkthrough): onboarding end-to-end (incl. slug-taken check, mid-flow `/dashboard` redirect, done-page URL), invite send/accept/resend (email delivery, double-click resend), invited sign-up returning to `/invite` (not onboarding), tiers/settings/team 403 guards + EDITOR sidebar filtering, admin club links, and `PUBLIC_SITE_DOMAIN` env override on embed/settings/marketing. Re-verify these flows after changes to onboarding, invites, or role guards.

### Housekeeping

- 25 svelte-check warnings, mostly `state_referenced_locally` (capturing `data`/`form` in `$state` initializers instead of `$derived`).

### Deferred (revisit when triggered)

- **Stripe integration** — the onboarding payment step is a stub, and `/admin/billing` has no real revenue data. Parked 2026-07-19 while Liam firms up the Stripe account/plan details; the biggest functional gap once unblocked.
- **Sequential DB round-trips** — see [Known performance issue](#known-performance-issue--sequential-db-round-trips); monitor load times first.
- **SvelteKit streaming** — blocked on Deno Deploy Pro plan for chunked responses.

### Done (recent)

- **Admin club management** (2026-07-19, verified by Liam) — `/admin/clubs` rows have Suspend/Reactivate (confirm dialog) and Delete (type-the-slug confirmation; transaction removes click events, invites, memberships, businesses, tiers, tags, disconnects any redeemed discount code — the schema has no `onDelete` cascades). Public hub + sponsor pages now 404 for `SUSPENDED` clubs (previously `status` was never checked, so suspension did nothing). Detail view still on the roadmap.

- **Analytics export** (2026-07-19, verified by Liam) — `GET /admin/analytics/export` (SITE_ADMIN, all clubs, last 90 days) and `GET /dashboard/analytics/export?period=` (club-scoped, honours the page's period filter) return CSV downloads; both Export buttons wired. Note: `+server.ts` endpoints don't inherit layout guards — each endpoint enforces its own auth.

### Testing

When testing features, lead Liam through the testing process asking for screenshots and confirmation that a feature is working rather than running through your usual test cycle. Less waste of tokens that way. When running testing, provide step by step instructions for how to test a feature if it's not obvious.
