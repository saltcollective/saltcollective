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

| Concern | Choice |
|---|---|
| Runtime | Deno |
| Deployment | Deno Deploy via `@sveltejs/adapter-auto` |
| Framework | SvelteKit |
| Components | Bits UI (headless) + CSS modules |
| Auth | Clerk via `clerk-sveltekit` |
| Database | Prisma Postgres (Prisma's managed serverless Postgres) |
| ORM | Prisma with Accelerate extension (edge-compatible) |
| File storage | AWS S3 |
| CDN | AWS CloudFront (serves S3 assets) |
| Styling | CSS modules — **no Tailwind** |

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

| Component | Description |
|---|---|
| `BrandLogo.svelte` | `<picture>` element serving CloudFront SVGs, switching dark/light via `prefers-color-scheme`. Prop: `height` (px). |
| `Button.svelte` | Native `button`/`a` element. Props: `variant` (`primary`\|`secondary`\|`ghost`\|`destructive`), `size` (`sm`\|`md`\|`lg`), `href` (renders anchor), `disabled`. All other attrs spread through. |
| `Label.svelte` | Native `label`. Prop: `required` (adds asterisk via CSS `::after`). Pass `for` via spread. |
| `Input.svelte` | Compound input — optional `label` string renders a `Label` above, optional `error` string renders message below with red border. `value` is `$bindable`. |
| `Badge.svelte` | Pure CSS status chip. Prop: `variant` (`default`\|`success`\|`warning`\|`destructive`). |
| `Stat.svelte` | Stat card — eyebrow label + large numeric value. Props: `label`, `value`. |
| `Grid.svelte` | CSS Grid layout primitive. Props: `cols` (number → `repeat(n,1fr)` or raw CSS string), `gap`, `rowGap`, `colGap`, `as` (polymorphic element tag). |
| `Container.svelte` | Max-width 1200px centered container. Props: `as` (element tag), `class`. |

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

| Variable | Value | Used by |
|---|---|---|
| `DATABASE_URL` | `postgresql://...` — set automatically by Deno Deploy | Prisma migrations (`db:push`, `db:migrate`), also used as `directUrl` in `schema.prisma` |
| `PRISMA_URL` | `prisma+postgres://...` — Prisma Accelerate connection string, set manually in Deno Deploy dashboard | App at runtime (`packages/schema/src/index.ts` reads this via `process.env.PRISMA_URL`) |

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

Operations requiring a tunnel (Studio, ad-hoc dev migrations) are invoked with the `--tunnel` flag:
```
deno task --tunnel db:migrate
```


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

Role-based guards on individual screens are not yet built. When adding a restricted screen (e.g. settings), check `role` from the parent layout data and throw `error(403)` if the user's role is insufficient:
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

| Component | Description |
|---|---|
| `Sidebar.svelte` | Nav (Dashboard → Settings), club mark + name in footer, slide-in drawer on mobile. Props: `club`, `activeRoute`, `open`, `onClose`. |
| `PageHeader.svelte` | Page title + optional subtitle + optional `{#snippet action()}` slot. Used at the top of every hub screen. |

Full spec (current state, screen designs, to-do list): [`hub-dashboard.md`](hub-dashboard.md).

### Screens built
- `dashboard/` — four `Stat` cards (total, active, inactive, views this month) + recent sponsors list
- `dashboard/sponsors/` — tier filter chips + business table; reflowed to card rows on mobile; Edit links to `/dashboard/sponsors/{id}/edit`

### Screens not yet built
- `dashboard/sponsors/new` — add sponsor form
- `dashboard/sponsors/[id]/edit` — edit sponsor form
- `dashboard/tiers/` — sponsor tier management
- `dashboard/analytics/` — click event reporting
- `dashboard/embed/` — embed code + shareable public hub link
- `dashboard/settings/` — club settings (name, slug, tagline, colours, logo, danger zone)

### Public hub page
- `(hub)/[slug]/` — public-facing sponsor listing page (not yet built); spec in [`hub-dashboard.md`](hub-dashboard.md)

## Onboarding (`apps/hub/src/routes/onboarding/`)

Multi-step wizard taking a new user from sign-up to a live club hub. Full spec: [`onboarding.md`](onboarding.md).

**Route:** `/onboarding/*` — 5 steps: club details → branding → tiers → payment (stub) → done.

**Status:** Implementation complete (untested end-to-end).

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

# Sync schema changes to DB during active modelling (no migration files created)
deno task db:push

# Generate a migration file when ready to ship a schema change to production
deno task --tunnel db:migrate

# Reset dev DB and regenerate migrations (use when db:push and migration history have drifted)
deno task --tunnel db:migrate:reset
```

Deployments push to `main` and trigger automatically. The deploy hook runs `prisma generate` then `prisma migrate deploy`. A migration file must exist before deploying schema changes — see README for the full workflow.
