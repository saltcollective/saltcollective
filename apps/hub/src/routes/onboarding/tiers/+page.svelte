<script lang="ts">
  import type { PageData } from './$types';
  import { enhance } from '$app/forms';

  let { data }: { data: PageData } = $props();

  type Tier = { name: string; price: string };

  const defaults: Tier[] = [
    { name: 'Gold', price: '' },
    { name: 'Silver', price: '' },
    { name: 'Bronze', price: '' },
  ];

  let tiers = $state<Tier[]>(
    data.existingTiers.length > 0 ? data.existingTiers : defaults,
  );
  let submitting = $state(false);

  function addTier() {
    if (tiers.length < 5) tiers = [...tiers, { name: '', price: '' }];
  }

  function removeTier(i: number) {
    tiers = tiers.filter((_, idx) => idx !== i);
  }

  function moveUp(i: number) {
    if (i === 0) return;
    const copy = [...tiers];
    [copy[i - 1], copy[i]] = [copy[i], copy[i - 1]];
    tiers = copy;
  }

  function moveDown(i: number) {
    if (i === tiers.length - 1) return;
    const copy = [...tiers];
    [copy[i], copy[i + 1]] = [copy[i + 1], copy[i]];
    tiers = copy;
  }
</script>

<div class="ob-content">
  <header class="ob-header">
    <h2 class="ob-title">Sponsor tiers</h2>
    <p class="ob-sub">Set up the sponsorship levels you offer — e.g. Gold, Silver, Bronze. You can edit these later.</p>
  </header>

  <form method="POST" action="?/save" class="ob-form"
    use:enhance={() => {
      submitting = true;
      return ({ update }) => { update(); submitting = false; };
    }}
  >
    <input type="hidden" name="clubId" value={data.clubId} />
    <input type="hidden" name="tiers" value={JSON.stringify(tiers)} />

    <div class="tier-list">
      {#each tiers as tier, i (i)}
        <div class="tier-row">
          <div class="tier-order">
            <button type="button" class="order-btn" onclick={() => moveUp(i)} disabled={i === 0} aria-label="Move up">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 8l4-4 4 4"/></svg>
            </button>
            <button type="button" class="order-btn" onclick={() => moveDown(i)} disabled={i === tiers.length - 1} aria-label="Move down">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 4l4 4 4-4"/></svg>
            </button>
          </div>
          <input
            type="text"
            class="ob-input tier-name"
            bind:value={tiers[i].name}
            placeholder="Tier name"
            maxlength="40"
            aria-label="Tier name"
          />
          <div class="price-wrap">
            <span class="price-symbol">$</span>
            <input
              type="number"
              class="ob-input price-input"
              bind:value={tiers[i].price}
              placeholder="0"
              min="0"
              step="0.01"
              aria-label="Price per month"
            />
            <span class="price-unit">/mo</span>
          </div>
          <button
            type="button"
            class="remove-btn"
            onclick={() => removeTier(i)}
            aria-label="Remove tier"
            disabled={tiers.length === 1}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 2l10 10M12 2L2 12"/></svg>
          </button>
        </div>
      {/each}
    </div>

    {#if tiers.length < 5}
      <button type="button" class="add-btn" onclick={addTier}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M7 2v10M2 7h10"/></svg>
        Add tier
      </button>
    {/if}

    <div class="ob-actions">
      <button type="submit" class="ob-btn ob-btn-primary" disabled={submitting}>
        {submitting ? 'Saving…' : 'Continue'}
      </button>
      <a href="/onboarding/payment?club={data.clubId}" class="ob-skip">Skip for now</a>
    </div>
  </form>
</div>

<style>
  .tier-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .tier-row {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .tier-order {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex-shrink: 0;
  }

  .order-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    background: transparent;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    color: var(--color-text-muted);
    cursor: pointer;
    padding: 0;
    transition: background-color 0.15s ease;
  }

  .order-btn:hover:not(:disabled) { background: var(--color-surface-2); color: var(--color-text); }
  .order-btn:disabled { opacity: 0.3; cursor: not-allowed; }

  .tier-name { flex: 1; min-width: 0; }

  .price-wrap {
    display: flex;
    align-items: center;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-bg);
    overflow: hidden;
    flex-shrink: 0;
    width: 100px;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }

  .price-wrap:focus-within {
    border-color: var(--color-accent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent) 20%, transparent);
  }

  .price-symbol, .price-unit {
    padding: var(--space-2) var(--space-1) var(--space-2) var(--space-2);
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    flex-shrink: 0;
  }

  .price-unit { padding: var(--space-2) var(--space-2) var(--space-2) 0; }

  .price-input {
    flex: 1;
    min-width: 0;
    border: none !important;
    box-shadow: none !important;
    background: transparent;
    padding: var(--space-2) 0;
    text-align: right;
  }

  .price-input:focus { outline: none; box-shadow: none !important; }

  .remove-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: transparent;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    color: var(--color-text-muted);
    cursor: pointer;
    padding: 0;
    flex-shrink: 0;
    transition: all 0.15s ease;
  }

  .remove-btn:hover:not(:disabled) {
    border-color: var(--color-destructive);
    color: var(--color-destructive);
    background: color-mix(in srgb, var(--color-destructive) 8%, transparent);
  }

  .remove-btn:disabled { opacity: 0.3; cursor: not-allowed; }

  .add-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    background: transparent;
    border: 1px dashed var(--color-border);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    font-family: var(--font-sans);
    color: var(--color-text-muted);
    cursor: pointer;
    transition: all 0.15s ease;
    align-self: flex-start;
  }

  .add-btn:hover {
    border-color: var(--color-accent);
    color: var(--color-accent);
  }
</style>
