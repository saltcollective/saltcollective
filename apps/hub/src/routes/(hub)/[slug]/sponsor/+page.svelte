<script lang="ts">
  import { onMount } from 'svelte';
  import { enhance } from '$app/forms';
  import { env } from '$env/dynamic/public';
  import type { PageData, ActionData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  const siteKey = env.PUBLIC_RECAPTCHA_SITE_KEY;

  const primary = $derived(data.club.primaryColour ?? '#68b7d2');
  const secondary = $derived(data.club.secondaryColour ?? '#f4a27e');
  const bg = $derived(data.club.backgroundColour);
  const theme = $derived(
    data.club.colorScheme === 'LIGHT' ? 'light' : data.club.colorScheme === 'DARK' ? 'dark' : null
  );

  let submitting = $state(false);

  onMount(() => {
    if (!siteKey) return;
    const s = document.createElement('script');
    s.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    s.async = true;
    document.head.appendChild(s);
  });

  async function recaptchaToken(): Promise<string> {
    const grecaptcha = (window as unknown as { grecaptcha?: any }).grecaptcha;
    if (!siteKey || !grecaptcha) return '';
    await new Promise<void>((resolve) => grecaptcha.ready(resolve));
    return grecaptcha.execute(siteKey, { action: 'sponsor_request' });
  }
</script>

<svelte:head>
  <title>Sponsor {data.club.name}</title>
</svelte:head>

<div
  class="page"
  data-theme={theme}
  style="--hub-primary: {primary}; --hub-secondary: {secondary}{bg ? `; --hub-bg: ${bg}` : ''}"
>
  <div class="wrap">
    <a class="back" href="/{data.club.slug}">← Back to {data.club.name}</a>

    {#if form?.success}
      <div class="card success">
        <div class="check" aria-hidden="true">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"><path d="M20 6 9 17l-5-5" /></svg
          >
        </div>
        <h1>Request sent</h1>
        <p>
          Thanks for your interest in sponsoring {data.club.name}. The club will be in touch with
          you shortly to finalise the details.
        </p>
        <a class="btn" href="/{data.club.slug}">Return to the hub</a>
      </div>
    {:else}
      <div class="card">
        <header class="head">
          <h1>Sponsor {data.club.name}</h1>
          <p>Tell us a little about your business and the club will get in touch.</p>
        </header>

        {#if form?.error}
          <p class="form-error">{form.error}</p>
        {/if}

        <form
          method="POST"
          use:enhance={async ({ formData }) => {
            submitting = true;
            formData.set('recaptchaToken', await recaptchaToken());
            return async ({ update }) => {
              await update();
              submitting = false;
            };
          }}
        >
          <!-- Honeypot: hidden from users, ignored by them, often filled by bots. -->
          <div class="hp" aria-hidden="true">
            <label for="company">Company</label>
            <input id="company" name="company" type="text" tabindex="-1" autocomplete="off" />
          </div>

          <div class="field">
            <label for="businessName">Business name <span class="req">*</span></label>
            <input
              id="businessName"
              name="businessName"
              type="text"
              maxlength="120"
              required
              value={form?.businessName ?? ''}
            />
          </div>

          <div class="field">
            <label for="description">Business description <span class="opt">(optional)</span></label>
            <textarea id="description" name="description" maxlength="500" rows="3"
              >{form?.description ?? ''}</textarea
            >
            <span class="hint">A short description of your business — shown on the hub once approved.</span>
          </div>

          <div class="row">
            <div class="field">
              <label for="contactName">Your name <span class="req">*</span></label>
              <input
                id="contactName"
                name="contactName"
                type="text"
                maxlength="120"
                required
                value={form?.contactName ?? ''}
              />
            </div>
            <div class="field">
              <label for="email">Email <span class="req">*</span></label>
              <input id="email" name="email" type="email" required value={form?.email ?? ''} />
            </div>
          </div>

          <div class="row">
            <div class="field">
              <label for="phone">Business phone <span class="opt">(optional)</span></label>
              <input id="phone" name="phone" type="tel" value={form?.phone ?? ''} />
            </div>
            <div class="field">
              <label for="confirmationPhone">Follow-up phone <span class="opt">(optional)</span></label>
              <input
                id="confirmationPhone"
                name="confirmationPhone"
                type="tel"
                value={form?.confirmationPhone ?? ''}
              />
              <span class="hint">The number we'll call to confirm — not shown publicly.</span>
            </div>
          </div>

          <div class="field">
            <label for="websiteUrl">Website <span class="opt">(optional)</span></label>
            <input
              id="websiteUrl"
              name="websiteUrl"
              type="url"
              placeholder="https://"
              value={form?.websiteUrl ?? ''}
            />
          </div>

          {#if data.tiers.length > 0}
            <div class="row">
              <div class="field">
                <label for="desiredTierId"
                  >Sponsorship level <span class="opt">(optional)</span></label
                >
                <select id="desiredTierId" name="desiredTierId" value={form?.desiredTierId ?? ''}>
                  <option value="">No preference</option>
                  {#each data.tiers as tier}
                    <option value={tier.id}>{tier.name}</option>
                  {/each}
                </select>
              </div>
              <div class="field">
                <label for="desiredSpend">Budget <span class="opt">(optional)</span></label>
                <input
                  id="desiredSpend"
                  name="desiredSpend"
                  type="text"
                  inputmode="decimal"
                  placeholder="$"
                />
              </div>
            </div>
          {/if}

          <div class="field">
            <label for="message"
              >Message <span class="opt"
                >(optional, good place to tell us more about your business)</span
              ></label
            >
            <textarea id="message" name="message" maxlength="800" rows="4"
              >{form?.message ?? ''}</textarea
            >
          </div>

          <button class="btn submit" type="submit" disabled={submitting}>
            {submitting ? 'Sending…' : 'Send request'}
          </button>

          <p class="legal">
            Protected by reCAPTCHA. The Google
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer"
              >Privacy Policy</a
            >
            and
            <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer"
              >Terms of Service</a
            >
            apply.
          </p>
        </form>
      </div>
    {/if}
  </div>
</div>

<style>
  .page {
    min-height: 100vh;
    background: var(--hub-bg, var(--color-bg));
    padding: var(--space-10) var(--space-6);
  }

  .wrap {
    max-width: 600px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
  }

  .back {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    text-decoration: none;
    width: fit-content;
  }

  .back:hover {
    color: var(--color-text);
  }

  .card {
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-8);
    box-shadow: var(--shadow-sm);
  }

  .head h1 {
    font-size: var(--text-2xl);
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--color-text);
    margin: 0 0 var(--space-2);
  }

  .head p {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    margin: 0 0 var(--space-6);
    line-height: var(--leading-normal);
  }

  form {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-4);
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .field label {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--color-text);
  }

  .req {
    color: var(--color-destructive);
  }

  .opt {
    font-weight: 400;
    color: var(--color-text-muted);
  }

  .hint {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    line-height: var(--leading-normal);
  }

  .field input,
  .field select,
  .field textarea {
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-2) var(--space-3);
    font-size: var(--text-sm);
    font-family: var(--font-sans);
    color: var(--color-text);
    width: 100%;
    box-sizing: border-box;
    transition:
      border-color 0.15s ease,
      box-shadow 0.15s ease;
  }

  .field input:focus,
  .field select:focus,
  .field textarea:focus {
    outline: none;
    border-color: var(--hub-primary);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--hub-primary) 20%, transparent);
  }

  .field textarea {
    resize: vertical;
    min-height: 96px;
  }

  /* Honeypot — visually and from-AT hidden, but still in the DOM for bots. */
  .hp {
    position: absolute;
    left: -9999px;
    width: 1px;
    height: 1px;
    overflow: hidden;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--hub-primary);
    color: #fff;
    font-size: var(--text-sm);
    font-weight: 700;
    text-decoration: none;
    padding: var(--space-3) var(--space-5);
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: opacity 0.15s ease;
  }

  .btn:hover {
    opacity: 0.9;
  }

  .submit {
    margin-top: var(--space-2);
  }

  .btn:disabled {
    opacity: 0.6;
    cursor: default;
  }

  .form-error {
    background: color-mix(in srgb, var(--color-destructive) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--color-destructive) 30%, transparent);
    border-radius: var(--radius-md);
    color: var(--color-destructive);
    font-size: var(--text-sm);
    padding: var(--space-3) var(--space-4);
    margin: 0 0 var(--space-5);
  }

  .legal {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    margin: var(--space-1) 0 0;
    line-height: var(--leading-normal);
  }

  .legal a {
    color: var(--color-text-muted);
    text-decoration: underline;
  }

  /* Success state */
  .success {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-3);
  }

  .check {
    width: 56px;
    height: 56px;
    border-radius: var(--radius-full);
    background: color-mix(in srgb, var(--hub-primary) 18%, transparent);
    color: var(--hub-primary);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .success h1 {
    font-size: var(--text-xl);
    font-weight: 800;
    color: var(--color-text);
    margin: 0;
  }

  .success p {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    line-height: var(--leading-normal);
    margin: 0 0 var(--space-2);
    max-width: 40ch;
  }

  @media (max-width: 540px) {
    .page {
      padding: var(--space-6) var(--space-4);
    }
    .card {
      padding: var(--space-6);
    }
    .row {
      grid-template-columns: 1fr;
    }
  }
</style>
