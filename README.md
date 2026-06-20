# Salt Collective Club Hub

Deno Deploy: https://github.com/saltcollective/saltcollective
Account: liam+salt@saltcollective.com

---

## Local development

Environment variables are injected by the Deno Deploy tunnel — no `.env` file needed.

```sh
deno task --tunnel dev
```

---

## Database workflow

Every schema change follows the same four steps — always create a migration file.

### 1. Edit the model

Update `packages/schema/prisma/schema.prisma`.

### 2. Create and apply the migration on dev

```sh
deno task --tunnel db:migrate
```

Prisma diffs the current schema against the last migration, prompts you to name the new migration, writes a SQL file under `packages/schema/prisma/migrations/`, and applies it to the dev database. The `--tunnel` flag injects the database connection env vars.

### 3. Commit and push

Commit the generated migration file **together with** the schema change and push to `main`.

### 4. CD deploys it

Pushing to `main` triggers deployment. The deploy hook runs:

1. `prisma generate` — regenerates the Prisma client
2. `deno task db:migrate:deploy` (`prisma migrate deploy`) — applies any pending migration files to the production database

No `--tunnel` in CD — Deno Deploy injects the env automatically. No manual steps as long as the migration file is committed.

### `db:push` — escape hatch only

`db:push` syncs the schema directly with **no migration file** and causes migration-history drift. Use it only for a throwaway/fresh dev environment where data loss is acceptable — never as part of the normal workflow above, and never against production.

```sh
# Reset the dev DB and replay all migrations from scratch (wipes data, fixes drift)
deno task --tunnel db:migrate:reset
```
