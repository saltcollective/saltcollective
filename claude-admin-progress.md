# Admin Interface — Implementation Progress

## Status: Complete (first pass, untested)

## What was built

### Design tokens updated
- `packages/ui/src/tokens.css` — accent updated to `#68b7d2` (sky blue), new `--color-accent-2: #f4a27e` (peach), light-mode variants added.

### New files created

**Shared infrastructure**
- `apps/hub/src/lib/admin.css` — global `adm-*` utility classes (stats, cards, tables, toolbar, charts, heatmap, bars) + `sc-btn` / `sc-badge` atoms. Side-effect imported in admin layout.
- `apps/hub/src/lib/components/AdminSidebar.svelte` — collapsible sidebar (240px ↔ 64px). Sections: Overview (Dashboard, Analytics), Manage (Clubs, Users, Billing). Inline SVG icons. Mobile drawer. Collapse toggle button in footer.

**Route group: `apps/hub/src/routes/admin/`**
- `+layout.server.ts` — redirects unauthenticated → `/sign-in`, throws 403 if `locals.user.userType !== 'SITE_ADMIN'`
- `+layout.svelte` — CSS grid shell (240px/64px sidebar + 1fr main), mobile top bar, scrim, imports admin.css
- `+page.server.ts` — redirects `/admin` → `/admin/dashboard`

**Screens (all have `+page.server.ts` + `+page.svelte`)**

| Route | Data | Notes |
|---|---|---|
| `/admin/dashboard` | Real: club counts, sponsor count, user count, recent 8 clubs | Overview card + billing-not-connected notice |
| `/admin/clubs` | Real: all clubs with member + sponsor counts | Client-side search + All/Active/Suspended filter chips |
| `/admin/users` | Real: all users with memberships | Client-side search + role/status filter chips, stats row |
| `/admin/billing` | Stub (`stripeConnected: false`) | Stripe-not-connected banner; MRR trend bars, plan mix, invoice table with placeholder data |
| `/admin/analytics` | Real: click counts, top clubs by clicks (30d), weekly trend (12w), weekday heatmap (8w) | SVG area chart, ranked bar list, heat grid — all from `ClickEvent` table |

## Access control
`locals.user.userType === 'SITE_ADMIN'` — set on the `User` model, checked in the admin layout server. Defined in `app.d.ts`, populated by `hooks.server.ts`.

## What's not done / known gaps
- No type-checking or test run yet — needs `deno task --tunnel dev` to verify
- Billing is fully stubbed (Stripe not integrated)
- No "Add club" or "Manage" actions wired up (buttons render but are ghost/disabled)
- Analytics `Export` button is ghost only
- Sidebar collapse state resets on page reload (not persisted to cookie/localStorage)
- The `drawerOpen` scrim in the layout relies on `class:drawerOpen` being applied to `.shell` — this was added in a fix pass

## Key files to check first if something breaks
- `apps/hub/src/routes/admin/+layout.server.ts` — access guard
- `apps/hub/src/lib/admin.css` — if styles are missing, check this was imported
- `apps/hub/src/lib/components/AdminSidebar.svelte` — sidebar collapse / mobile drawer

## Design reference
Design bundle was fetched from `https://api.anthropic.com/v1/design/h/fWttCly0rvuTvZevHePgVg` and extracted to `/tmp/design-extract/salt-collective-design-system/`. Key files:
- `project/ui_kits/admin-app/` — JSX mockups for all screens
- `project/ui_kits/admin-app/admin.css` — CSS reference (adapted to `adm-*` classes in `admin.css`)
- `project/colors_and_type.css` — token source of truth
