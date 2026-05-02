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

#### Layout system
- `Container.svelte` — max-width 1200px, centered, with horizontal padding. Use as a section wrapper.
- `Grid.svelte` — CSS Grid primitive. For responsive layouts, define grid rules in each page/component's own `<style>` block.
- Route group layouts (`(marketing)/+layout.svelte`, `(app)/+layout.svelte`, etc.) define page shells — nav, footer, sidebars.

#### Current atoms (`packages/ui/src/lib/`)

| Component | Description |
|---|---|
| `Button.svelte` | Native `button`/`a` element. Props: `variant` (`primary`\|`secondary`\|`ghost`\|`destructive`), `size` (`sm`\|`md`\|`lg`), `href` (renders anchor), `disabled`. All other attrs spread through. |
| `Label.svelte` | Native `label`. Prop: `required` (adds asterisk via CSS `::after`). Pass `for` via spread. |
| `Input.svelte` | Compound input — optional `label` string renders a `Label` above, optional `error` string renders message below with red border. `value` is `$bindable`. |
| `Badge.svelte` | Pure CSS status chip. Prop: `variant` (`default`\|`success`\|`warning`\|`destructive`). |
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

## Auth
Clerk via `clerk-sveltekit`. All auth logic lives in `apps/hub`. No auth-specific components belong in `packages/ui`.

## Adapter Note
`@sveltejs/adapter-auto` is used. Deno Deploy is not in adapter-auto's platform detection list — it will fall back to `adapter-node`, which runs via Deno's Node.js compatibility mode. If platform-specific issues arise at deploy time, the escape hatch is switching to `@sveltejs/adapter-deno`.

## Deno Deploy Constraints
- No filesystem access at runtime
- No direct TCP database connections — Prisma Postgres uses HTTP via Accelerate, which works here
- No persistent in-memory state between requests
- npm packages that rely on native Node bindings will not work
- Environment variables are set in the Deno Deploy dashboard (`.env` locally)

## Development
TODO: populate with commands once scaffolded.
