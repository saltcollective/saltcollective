# Data Modelling

Prisma schema lives in `packages/schema/prisma/schema.prisma`. Each model is documented here as a reference alongside the schema.

## Files

| File | Models |
|---|---|
| [user.md](user.md) | `User`, `ClubMembership`, `ImpersonationLog` |
| [club.md](club.md) | `Club` |
| [sponsor-tier.md](sponsor-tier.md) | `SponsorTier` |
| [business.md](business.md) | `Business`, `Tag` |
| [click-event.md](click-event.md) | `ClickEvent` |

---

## Database workflow

Every schema change is shipped as a migration file. The canonical four-step process:

1. **Edit the model** in `packages/schema/prisma/schema.prisma`.
2. **Create + apply the migration on dev** — `deno task --tunnel db:migrate` generates a SQL migration file under `prisma/migrations/`, applies it to the dev database, and records it in `_prisma_migrations`.
3. **Commit the migration file** with the schema change and **push to `main`**.
4. **CD deploys it** — the deploy hook runs `prisma generate` then `deno task db:migrate:deploy` (`prisma migrate deploy`), replaying any pending migrations against production in order.

### Running commands

Tasks are defined in `packages/schema/deno.json` and proxied from the root `deno.json`:

```sh
deno task --tunnel db:migrate         # generate + apply a migration on dev
deno task --tunnel db:migrate:reset   # wipe dev DB + replay all migrations
deno task --tunnel db:studio          # open Prisma Studio
```

Local migration commands need the `--tunnel` flag to inject `DATABASE_URL`/`PRISMA_URL`. In CD, `db:migrate:deploy` runs **without** `--tunnel` because Deno Deploy injects the env automatically.

### `db:push` — escape hatch only

**`db:push`** syncs the schema directly with **no migration file** and causes migration-history drift — Prisma drops/recreates whatever it needs to match the schema. Use it only for a throwaway/fresh dev environment where data loss is acceptable, never in the normal workflow above and never against production.
