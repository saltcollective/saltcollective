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

### During active development (schema still changing)

Use `db:push` to sync schema changes directly to the database without creating migration files. Fast, no history.

```sh
deno task db:push
```

### When the schema is ready to ship

Once the schema is stable and you're ready for a production deployment, generate a migration file:

```sh
deno task --tunnel db:migrate
```

Prisma will diff the current schema against the last migration and prompt you to name the new migration. This creates a SQL file under `packages/schema/prisma/migrations/`.

Commit the generated migration file — the deploy hook runs `db:migrate:deploy` on every production deployment to apply it.

### Rules of thumb

- Use `db:push` freely while modelling — it won't clutter the migrations folder
- Switch to `db:migrate` when you're about to deploy a schema change to production
- Never run `db:push` against production — always use `db:migrate:deploy` there (the deploy hook handles this)
- If you've been using `db:push` and need to ship accumulated changes, run `db:migrate` once to capture everything in a single migration file before deploying

---

## Deployment

Deployments are triggered automatically by pushing to `main`. The deploy hook runs:

1. `prisma generate` — regenerates the Prisma client
2. `prisma migrate deploy` — applies any pending migration files to the production database

No manual steps needed as long as a migration file exists for the schema changes being deployed.
