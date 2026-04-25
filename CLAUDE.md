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
| Styling | CSS modules — **no Tailwind** |

## Key Conventions

### Components (`packages/ui`)
- Bits UI provides headless, accessible primitives
- All styling via CSS modules — use `<style module>` in `.svelte` files, access classes via `$style.className`
- Components must be **generic and schema-agnostic**
- Database-aware wrappers or adapters that bind to schema shapes live in `apps/hub`, not `packages/ui`

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
