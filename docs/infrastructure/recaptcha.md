# reCAPTCHA

Google reCAPTCHA protects unauthenticated, public-facing forms from spam and abuse. The first consumer is the [Sponsor Request](../features/hub-sponsor-request.md) form, which is open to anyone on a published hub and creates database records + sends email — exactly the kind of endpoint that needs protection.

## Which version

Use **reCAPTCHA v3** (invisible, score-based). It runs in the background and returns a score from `0.0` (likely bot) to `1.0` (likely human) — no checkbox, no user friction, which suits a low-commitment "express interest" form. We enforce a server-side score threshold (default `0.5`) and can fall back to a v2 challenge later if abuse slips through. The server helper supports both versions, so switching is low-cost.

## Architecture

```
Browser: load reCAPTCHA script with SITE key
Browser: grecaptcha.execute(siteKey, { action }) → token
Browser → POST form (token included) → SvelteKit server
Server:  verifyRecaptcha(token) → Google siteverify (SECRET key) → { ok, score }
Server:  reject if !ok, otherwise process the submission
```

Two keys, never mix them up:

| Key | Visibility | Used by | Env var |
|---|---|---|---|
| Site key | Public (shipped to the browser) | client script | `PUBLIC_RECAPTCHA_SITE_KEY` |
| Secret key | **Private** (server only) | `verifyRecaptcha` | `RECAPTCHA_SECRET_KEY` |

The `PUBLIC_` prefix is required for SvelteKit to expose the site key to the browser via `$env/static/public`. The secret key has no prefix and is read server-side via `$env/dynamic/private` — it must never reach the client.

## Setup walkthrough

### Step 1 — Register the site with Google

1. Go to the [reCAPTCHA admin console](https://www.google.com/recaptcha/admin/create) (sign in with the Salt Collective Google account).
2. **Label:** `Salt Collective Club Hub`.
3. **reCAPTCHA type:** *Score based (v3)*.
4. **Domains:** add every domain the form runs on:
   - `saltcollective.club` (and any subdomains hubs are served from)
   - `localhost` (required for local `--tunnel` development)
   - your Deno Deploy preview domain(s) if you test there
5. Accept the terms and submit. Google shows two keys: the **site key** and the **secret key**.

### Step 2 — Store the keys

Per project convention, **all env vars come from the Deno Deploy dashboard and are injected locally via `--tunnel` — do not create `.env` files**.

In the Deno Deploy dashboard for this project, add:

| Variable | Value |
|---|---|
| `PUBLIC_RECAPTCHA_SITE_KEY` | the site key from Step 1 |
| `RECAPTCHA_SECRET_KEY` | the secret key from Step 1 |

Both are then available locally when you run `deno task --tunnel dev`.

### Step 3 — Load and execute on the client

In the sponsor request form (`(hub)/[slug]/sponsor/+page.svelte`), load the script with the site key and fetch a token on submit:

```svelte
<script lang="ts">
  import { PUBLIC_RECAPTCHA_SITE_KEY } from '$env/static/public';
  import { onMount } from 'svelte';

  let token = $state('');

  onMount(() => {
    const s = document.createElement('script');
    s.src = `https://www.google.com/recaptcha/api.js?render=${PUBLIC_RECAPTCHA_SITE_KEY}`;
    document.head.appendChild(s);
  });

  async function getToken() {
    // grecaptcha is added to window by the script above
    token = await window.grecaptcha.execute(PUBLIC_RECAPTCHA_SITE_KEY, {
      action: 'sponsor_request',
    });
  }
</script>

<!-- call getToken() before/at submit, then send `token` as a hidden field -->
```

Send the resulting token with the form (e.g. a hidden `g-recaptcha-response` field or a JSON field) so the server action receives it.

### Step 4 — Verify on the server

Use the shared helper `apps/hub/src/lib/server/recaptcha.ts`:

```ts
import { verifyRecaptcha } from '$lib/server/recaptcha';
import { fail } from '@sveltejs/kit';

export const actions = {
  default: async ({ request, getClientAddress }) => {
    const fd = await request.formData();
    const token = fd.get('recaptchaToken') as string | null;

    const check = await verifyRecaptcha(token, {
      expectedAction: 'sponsor_request',
      remoteIp: getClientAddress(),
    });
    if (!check.ok) {
      return fail(400, { error: 'Could not verify you are human. Please try again.' });
    }

    // ... honeypot check, rate-limit, create LEAD business, send admin email ...
  },
};
```

The helper validates Google's `success`, matches the `action`, and enforces the score threshold (default `0.5`, override via `threshold`). It throws if `RECAPTCHA_SECRET_KEY` is missing, so a misconfigured environment fails loudly rather than silently letting bots through.

## Defense in depth

reCAPTCHA is one layer. The sponsor request form should also have:

- A **honeypot** field — a hidden input real users never fill; reject silently if populated.
- **Rate limiting** — cap submissions per client/IP per club per minute.

## Local development

- Register `localhost` as a domain (Step 1) or verification fails locally.
- Run with the tunnel so both keys are injected: `deno task --tunnel dev`.
- v3 scores are often low/erratic on `localhost`; lower the threshold while developing (e.g. `verifyRecaptcha(token, { threshold: 0.1 })`) and restore the default before shipping.

## Testing

- Submit with **no token** → rejected (`reason: 'missing-token'`).
- Submit with a **garbage token** → rejected (`reason: 'verification-failed'`).
- Submit a **valid token with the wrong action** → rejected (`reason: 'unexpected-action:…'`).
- **Missing `RECAPTCHA_SECRET_KEY`** → the helper throws (config error surfaces immediately).
- Confirm the **secret key never appears in client bundles** — only `PUBLIC_RECAPTCHA_SITE_KEY` should be in browser output.
