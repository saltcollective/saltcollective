<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData, ActionData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  let applying = $state(false);
</script>

<div class="ob-content">
  <header class="ob-header">
    <h2 class="ob-title">Choose a plan</h2>
    <p class="ob-sub">Keep your hub running with a Salt Collective subscription.</p>
  </header>

  <div class="plan-card">
    <div class="plan-badge">Most popular</div>
    <div class="plan-name">Hub</div>
    <div class="plan-price">
      <span class="plan-amount">$49</span>
      <span class="plan-period">/year</span>
    </div>
    <p class="plan-alt">or $5/month</p>
    <ul class="plan-features">
      <li>Unlimited sponsors</li>
      <li>Custom branding</li>
      <li>Analytics dashboard</li>
      <li>Embeddable widget</li>
      <li>Shareable hub page</li>
    </ul>
    <button
      class="ob-btn ob-btn-primary plan-btn"
      disabled
      title="Stripe integration coming soon"
    >
      Start subscription
    </button>
    <p class="plan-soon">Subscription payments coming soon.</p>
  </div>

  <div class="divider"><span>or</span></div>

  <div class="code-section">
    <p class="code-label">Have a discount code?</p>
    <form
      method="POST"
      action="?/applyCode&club={data.clubId}"
      use:enhance={() => {
        applying = true;
        return ({ update }) => { update(); applying = false; };
      }}
    >
      <div class="code-row">
        <input
          type="text"
          name="code"
          class="code-input"
          placeholder="Enter code"
          autocomplete="off"
          spellcheck="false"
        />
        <button type="submit" class="ob-btn ob-btn-secondary" disabled={applying}>
          {applying ? 'Applying…' : 'Apply'}
        </button>
      </div>
      {#if form?.codeError}
        <p class="code-error">{form.codeError}</p>
      {/if}
    </form>
  </div>

  <a href="/onboarding/done?club={data.clubId}" class="ob-skip">
    Skip for now — I'll set this up later
  </a>
</div>

<style>
  .plan-card {
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-6);
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    position: relative;
  }

  .plan-badge {
    position: absolute;
    top: calc(-1 * var(--space-3));
    left: var(--space-6);
    background: var(--color-accent);
    color: var(--color-accent-fg);
    font-size: var(--text-xs);
    font-weight: 600;
    padding: 2px var(--space-2);
    border-radius: var(--radius-full);
  }

  .plan-name {
    font-size: var(--text-lg);
    font-weight: 700;
    color: var(--color-text);
  }

  .plan-price {
    display: flex;
    align-items: baseline;
    gap: var(--space-1);
  }

  .plan-amount {
    font-size: var(--text-2xl);
    font-weight: 700;
    color: var(--color-text);
  }

  .plan-period {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
  }

  .plan-alt {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    margin: calc(-1 * var(--space-2)) 0 0;
  }

  .plan-features {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .plan-features li {
    font-size: var(--text-sm);
    color: var(--color-text);
    padding-left: var(--space-5);
    position: relative;
  }

  .plan-features li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 4px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: color-mix(in srgb, var(--color-accent) 20%, transparent);
    border: 1.5px solid var(--color-accent);
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10' fill='none' stroke='%2368b7d2' stroke-width='1.8' stroke-linecap='round'%3E%3Cpath d='M2 5l2.5 2.5L8 2'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: center;
    background-size: 10px;
  }

  .plan-btn { margin-top: var(--space-2); }

  .plan-soon {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    text-align: center;
    margin: calc(-1 * var(--space-2)) 0 0;
  }

  /* ---- Divider ---- */
  .divider {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    color: var(--color-text-muted);
    font-size: var(--text-xs);
  }

  .divider::before,
  .divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--color-border);
  }

  /* ---- Discount code section ---- */
  .code-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .code-label {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    margin: 0;
  }

  .code-row {
    display: flex;
    gap: var(--space-2);
  }

  .code-input {
    flex: 1;
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-2) var(--space-3);
    font-size: var(--text-sm);
    font-family: var(--font-sans);
    color: var(--color-text);
    letter-spacing: 0.05em;
    text-transform: uppercase;
    transition: border-color 0.15s;
  }

  .code-input:focus {
    outline: none;
    border-color: var(--color-accent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent) 20%, transparent);
  }

  .code-error {
    font-size: var(--text-xs);
    color: var(--color-destructive);
    margin: 0;
  }
</style>
