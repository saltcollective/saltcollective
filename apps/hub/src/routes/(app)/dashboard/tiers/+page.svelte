<script lang="ts">
  import { Button } from '@saltcollective/ui';
  import PageHeader from '$lib/components/PageHeader.svelte';
  import { enhance } from '$app/forms';
  import type { PageData, ActionData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  type Tier = { id?: string; name: string; price: string; businessCount: number };

  let tiers = $state<Tier[]>(
    data.tiers.length > 0
      ? data.tiers.map((t) => ({ id: t.id, name: t.name, price: t.price, businessCount: t.businessCount }))
      : [
          { name: 'Gold', price: '', businessCount: 0 },
          { name: 'Silver', price: '', businessCount: 0 },
          { name: 'Bronze', price: '', businessCount: 0 },
        ],
  );
  let submitting = $state(false);

  const serialized = $derived(
    JSON.stringify(tiers.map(({ id, name, price }) => ({ id, name, price }))),
  );

  function addTier() {
    if (tiers.length < 5) tiers = [...tiers, { name: '', price: '', businessCount: 0 }];
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

<div class="screen">
  <PageHeader
    title="Sponsor tiers"
    subtitle="Manage the sponsorship levels you offer. Tiers with sponsors assigned cannot be deleted."
  />

  <div class="card">
    <form
      method="POST"
      action="?/save"
      use:enhance={() => {
        submitting = true;
        return ({ update }) => { update({ reset: false }); submitting = false; };
      }}
    >
      <input type="hidden" name="tiers" value={serialized} />

      {#if form?.error}
        <p class="form-error">{form.error}</p>
      {/if}

      {#if form?.success}
        <p class="form-success">Tiers saved.</p>
      {/if}

      <div class="tier-list">
        {#each tiers as tier, i (i)}
          <div class="tier-row">
            <div class="tier-order">
              <button
                type="button"
                class="order-btn"
                onclick={() => moveUp(i)}
                disabled={i === 0}
                aria-label="Move up"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 8l4-4 4 4"/></svg>
              </button>
              <button
                type="button"
                class="order-btn"
                onclick={() => moveDown(i)}
                disabled={i === tiers.length - 1}
                aria-label="Move down"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 4l4 4 4-4"/></svg>
              </button>
            </div>

            <input
              type="text"
              class="input tier-name"
              bind:value={tiers[i].name}
              placeholder="Tier name"
              maxlength="40"
              aria-label="Tier name"
            />

            {#if tier.businessCount > 0}
              <span class="count-badge">{tier.businessCount} sponsor{tier.businessCount === 1 ? '' : 's'}</span>
            {/if}

            <div class="price-wrap">
              <span class="price-symbol">$</span>
              <input
                type="number"
                class="input price-input"
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
              disabled={tiers.length === 1 || tier.businessCount > 0}
              title={tier.businessCount > 0
                ? `Reassign the ${tier.businessCount} sponsor${tier.businessCount === 1 ? '' : 's'} in this tier before deleting it`
                : undefined}
              aria-label="Remove tier"
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

      <div class="actions">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </form>
  </div>
</div>

<style>
  .screen {
    padding: var(--space-8) var(--space-10);
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
    max-width: 680px;
  }

  .card {
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-6);
  }

  .form-error {
    background: color-mix(in srgb, var(--color-destructive) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--color-destructive) 30%, transparent);
    border-radius: var(--radius-md);
    color: var(--color-destructive);
    font-size: var(--text-sm);
    padding: var(--space-3) var(--space-4);
    margin-bottom: var(--space-5);
  }

  .form-success {
    background: color-mix(in srgb, var(--color-success) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--color-success) 30%, transparent);
    border-radius: var(--radius-md);
    color: var(--color-success);
    font-size: var(--text-sm);
    padding: var(--space-3) var(--space-4);
    margin-bottom: var(--space-5);
  }

  .tier-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    margin-bottom: var(--space-4);
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

  .order-btn:hover:not(:disabled) { background: var(--color-surface); color: var(--color-text); }
  .order-btn:disabled { opacity: 0.3; cursor: not-allowed; }

  .input {
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-2) var(--space-3);
    font-size: var(--text-sm);
    font-family: var(--font-sans);
    color: var(--color-text);
    box-sizing: border-box;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }

  .input:focus {
    outline: none;
    border-color: var(--color-accent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent) 20%, transparent);
  }

  .tier-name { flex: 1; min-width: 0; }

  .count-badge {
    font-size: var(--text-xs);
    font-weight: 500;
    color: var(--color-text-muted);
    white-space: nowrap;
    padding: var(--space-1) var(--space-2);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-full);
    flex-shrink: 0;
  }

  .price-wrap {
    display: flex;
    align-items: center;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-bg);
    overflow: hidden;
    flex-shrink: 0;
    width: 110px;
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
    margin-bottom: var(--space-6);
    transition: all 0.15s ease;
  }

  .add-btn:hover {
    border-color: var(--color-accent);
    color: var(--color-accent);
  }

  .actions {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  @media (max-width: 820px) {
    .screen { padding: var(--space-6) var(--space-4); }
  }
</style>
