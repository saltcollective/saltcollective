# Staging environment

A `staging` git branch deploys automatically to its own environment for testing features before they merge to `main` (production). Set up and verified 2026-08-12.

## How it works

Deno Deploy gives every git branch its own **timeline** with its own URL:

| Timeline               | URL                                                  | Deployed by                 |
| ---------------------- | ---------------------------------------------------- | --------------------------- |
| Production (`main`)    | `saltcollective.saltcollective.deno.net`             | push/merge to `main`        |
| Git branch (`staging`) | `saltcollective--staging.saltcollective.deno.net`    | push to `staging`           |
| Preview (per-revision) | `saltcollective-<revision-id>.saltcollective.deno.net` | every revision (build page) |

**Workflow:** develop locally (`--tunnel`) → push/merge to `staging` → verify on the staging URL → merge `staging` into `main` to ship.

## Environment variable contexts

Env vars in the Deno Deploy dashboard are scoped to **contexts**, not branches:

| Context      | Applies to                                             |
| ------------ | ------------------------------------------------------ |
| `Production` | the production timeline (`main`)                       |
| `Preview`    | **all** branch timelines (incl. staging) and previews  |
| `Local`      | local dev via `deno task --tunnel …`                   |
| `Build`      | the build step only                                    |

Most vars (`AWS_*`, Clerk keys, `RESEND_KEY`, reCAPTCHA) are scoped `All` and shared everywhere. The per-context ones are `PRISMA_URL` and `PUBLIC_SITE_DOMAIN`.

⚠️ When pasting a connection string into an env var value, paste **only the bare URL** — not the `DATABASE_URL="…"` `.env`-style line the Prisma console's copy button produces. The app's engine-less Prisma client requires `PRISMA_URL` to start with `prisma+postgres://` (Accelerate); a direct `postgresql://` URL fails at runtime with `PrismaClientInitializationError: the URL must start with the protocol prisma://`.

## Databases

One Prisma Postgres instance holds a separate **logical database per timeline**, auto-provisioned by Deno Deploy:

| Logical DB          | Used by                                       | Runtime access (`PRISMA_URL` context)      |
| ------------------- | --------------------------------------------- | ------------------------------------------ |
| `c95a0e-production` | production                                    | `Production` — prod Accelerate key         |
| `c95a0e--staging`   | staging branch                                | `Preview` — staging Accelerate key         |
| `c95a0e-preview`    | local dev (tunnel)                            | `Local` — dev Accelerate key               |

Deno Deploy injects `DATABASE_URL` (direct Postgres) per timeline automatically — used only by migrations. The app at runtime reads `PRISMA_URL`, which must be set per context to the matching database's Accelerate connection string (generated in the Prisma console — the instance is claimed there, so each logical DB appears once provisioned).

Staging shares nothing with production or local dev: the staging DB starts empty, so onboard a test club after first deploy. Ad-hoc preview deployments of other branches also run in the `Preview` context and therefore share the staging database.

## Migrations

The pre-deploy command (`deno task db:migrate:deploy`, configured in the dashboard) runs on every timeline rollout against that timeline's injected `DATABASE_URL` — it is skipped on per-revision preview timelines. So:

- push to `staging` → pending migration files apply to `c95a0e--staging`
- merge to `main` → they apply to `c95a0e-production`
- local dev → `deno task --tunnel db:migrate` applies to the dev DB, as before

The canonical schema-change workflow (see `docs/data-modelling/README.md`) is unchanged — the migration file committed with the schema change is what each environment replays.

Known flake: on the very first provision of a branch's logical DB, the pre-deploy step can run before credentials are injected and fail with `P1001: Can't reach database server at localhost:5432`. Retry the deploy from the build page — it resolves once the DB exists.

## Staging caveats

- **Emails are real.** `RESEND_KEY` is scoped `All`, so invites/notifications from staging actually send.
- **Clerk is the shared instance** — staging and production see the same user accounts.
- **reCAPTCHA**: the staging domain must be in the allowed domains list in the Google admin console (see `recaptcha.md`).
- **`PUBLIC_SITE_DOMAIN`** should be set in the `Preview` context to `saltcollective--staging.saltcollective.deno.net` so displayed/embedded URLs point at staging.
- The public hub page's Accelerate cache means content changes can take a few minutes to appear, same as production.
