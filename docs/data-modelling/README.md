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

### `db:push` vs `db:migrate`

**`db:push`** syncs the schema directly to the database with no migration files created. Fast, no history, no tracking — Prisma will drop and recreate whatever it needs to match the schema. Use this during active data modelling while the schema is still being shaped.

**`db:migrate`** (`prisma migrate dev`) generates a SQL migration file under `prisma/migrations/`, applies it, and records it in `_prisma_migrations`. Builds a history of every schema change. When deploying to production you run `migrate deploy`, which replays that history in order.

Switch from `db:push` to `db:migrate` once the schema stabilises and you're approaching a first real deployment.

### Running commands

Tasks are defined in `packages/schema/deno.json` and proxied from the root `deno.json`:

```sh
deno task db:push        # sync schema to DB (no migration files)
deno task db:migrate     # generate + apply a migration
deno task db:studio      # open Prisma Studio (requires --tunnel)
```

Operations that make direct TCP connections (Studio, some migration tooling) need the `--tunnel` flag:

```sh
deno task --tunnel db:migrate
```

Prisma Postgres connects via HTTP through Accelerate and does not need the tunnel for push or deploy operations.
