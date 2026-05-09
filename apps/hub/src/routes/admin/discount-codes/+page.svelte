<script lang="ts">
  import '$lib/admin.css';
  import { enhance } from '$app/forms';
  import type { PageData, ActionData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  let submitting = $state(false);
  let deleting = $state<string | null>(null);

  function fmt(date: Date | string) {
    return new Intl.DateTimeFormat('en-AU', {
      day: 'numeric', month: 'short', year: 'numeric',
    }).format(new Date(date));
  }
</script>

<div class="adm-screen">
  <div class="adm-topbar">
    <div class="adm-topbar-main">
      <h1 class="adm-page-title">Discount Codes</h1>
      <p class="adm-page-sub">Single-use access codes that bypass the payment step during onboarding.</p>
    </div>
  </div>

  <section class="adm-card create-card">
    <h2 class="create-title">Create code</h2>
    <form
      method="POST"
      action="?/create"
      use:enhance={() => {
        submitting = true;
        return ({ update }) => { update(); submitting = false; };
      }}
    >
      {#if form?.error}
        <p class="form-error">{form.error}</p>
      {/if}
      {#if form?.success}
        <p class="form-success">Code created.</p>
      {/if}
      <div class="create-row">
        <input
          type="text"
          name="code"
          class="adm-input"
          placeholder="Leave blank to auto-generate, or enter a custom code (8–16 chars, A–Z 0–9)"
          value={form?.code ?? ''}
          autocomplete="off"
          spellcheck="false"
          style="font-family: var(--font-mono, monospace); text-transform: uppercase;"
        />
        <input
          type="text"
          name="description"
          class="adm-input"
          placeholder="Note (optional)"
          value={form?.description ?? ''}
        />
        <button type="submit" class="sc-btn sc-btn-primary" disabled={submitting}>
          {submitting ? 'Saving…' : 'Generate & Save'}
        </button>
      </div>
    </form>
  </section>

  <section class="adm-card adm-card-flush adm-table-wrap">
    <table class="adm-table">
      <thead>
        <tr>
          <th>Code</th>
          <th>Description</th>
          <th>Created by</th>
          <th>Created</th>
          <th>Status</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {#each data.codes as c (c.id)}
          {@const redeemed = !!c.redeemedAt}
          <tr>
            <td><code class="code-chip">{c.code}</code></td>
            <td class="adm-cell-muted">{c.description ?? '—'}</td>
            <td class="adm-cell-muted">{c.createdBy.email}</td>
            <td class="adm-cell-muted">{fmt(c.createdAt)}</td>
            <td>
              {#if redeemed}
                <div>
                  <span class="sc-badge sc-badge-default">Redeemed</span>
                  <div class="redeemed-sub">
                    {c.redeemedBy?.name ?? 'Unknown club'} · {fmt(c.redeemedAt!)}
                  </div>
                </div>
              {:else}
                <span class="sc-badge sc-badge-success">Unused</span>
              {/if}
            </td>
            <td class="adm-cell-action">
              {#if !redeemed}
                <form
                  method="POST"
                  action="?/delete"
                  use:enhance={({ cancel }) => {
                    if (!confirm('Delete this code? This cannot be undone.')) { cancel(); return; }
                    deleting = c.id;
                    return ({ update }) => { update(); deleting = null; };
                  }}
                >
                  <input type="hidden" name="id" value={c.id} />
                  <button type="submit" class="sc-btn sc-btn-ghost sc-btn-sm" disabled={deleting === c.id}>
                    {deleting === c.id ? 'Deleting…' : 'Delete'}
                  </button>
                </form>
              {/if}
            </td>
          </tr>
        {/each}
        {#if data.codes.length === 0}
          <tr>
            <td colspan="6" class="empty">No discount codes yet.</td>
          </tr>
        {/if}
      </tbody>
    </table>
  </section>
</div>

<style>
  .create-card {
    padding: var(--adm-space-5, 1.25rem) var(--adm-space-6, 1.5rem);
  }

  .create-title {
    font-size: 0.9375rem;
    font-weight: 700;
    margin: 0 0 0.75rem;
    color: var(--adm-text, inherit);
  }

  .create-row {
    display: grid;
    grid-template-columns: 1fr 1fr auto;
    gap: 0.5rem;
    align-items: start;
  }

  .adm-input {
    background: var(--adm-bg, #0e0e10);
    border: 1px solid var(--adm-border, rgba(255,255,255,0.1));
    border-radius: 6px;
    padding: 0.375rem 0.625rem;
    font-size: 0.8125rem;
    font-family: inherit;
    color: var(--adm-text, #e8e8ee);
    width: 100%;
    box-sizing: border-box;
    transition: border-color 0.15s;
  }

  .adm-input:focus {
    outline: none;
    border-color: var(--adm-accent, #68b7d2);
  }

  .form-error {
    font-size: 0.8125rem;
    color: #f87171;
    margin: 0 0 0.5rem;
  }

  .form-success {
    font-size: 0.8125rem;
    color: #4ade80;
    margin: 0 0 0.5rem;
  }

  .code-chip {
    font-family: var(--font-mono, 'Courier New', monospace);
    font-size: 0.8125rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    background: rgba(255,255,255,0.06);
    border-radius: 4px;
    padding: 2px 6px;
    color: var(--adm-text, #e8e8ee);
  }

  .redeemed-sub {
    font-size: 0.75rem;
    color: var(--adm-text-muted, rgba(232,232,238,0.5));
    margin-top: 2px;
  }

  .empty {
    padding: 2.5rem;
    text-align: center;
    color: var(--adm-text-muted, rgba(232,232,238,0.5));
    font-size: 0.875rem;
  }

  @media (max-width: 700px) {
    .create-row {
      grid-template-columns: 1fr;
    }
  }
</style>
