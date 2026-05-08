<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  let copied = $state(false);
  const hubUrl = $derived(`saltcollective.club/${data.slug}`);

  async function copyUrl() {
    await navigator.clipboard.writeText(`https://${hubUrl}`);
    copied = true;
    setTimeout(() => (copied = false), 2000);
  }
</script>

<div class="ob-content done-content">
  <div class="check-wrap">
    <div class="check-circle">
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none"
           stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M5 14l6 6L23 8" />
      </svg>
    </div>
  </div>

  <header class="ob-header" style="text-align: center">
    <h2 class="ob-title">Your hub is live.</h2>
    <p class="ob-sub">{data.clubName} is now published on Salt Collective.</p>
  </header>

  <div class="url-card">
    <span class="url-label">Your hub URL</span>
    <div class="url-row">
      <span class="url-text">{hubUrl}</span>
      <button class="copy-btn" type="button" onclick={copyUrl}>
        {#if copied}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 7l3.5 3.5L12 3"/></svg>
          Copied
        {:else}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="5" width="7" height="7" rx="1"/><path d="M5 5V3a1 1 0 011-1h5a1 1 0 011 1v5a1 1 0 01-1 1H9"/></svg>
          Copy
        {/if}
      </button>
    </div>
  </div>

  <div class="ob-actions">
    <a href="/dashboard" class="ob-btn ob-btn-primary">Go to your hub</a>
  </div>
</div>

<style>
  .done-content { align-items: center; }

  .check-wrap {
    display: flex;
    justify-content: center;
  }

  .check-circle {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: color-mix(in srgb, var(--color-accent) 15%, transparent);
    border: 2px solid var(--color-accent);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-accent);
  }

  .url-card {
    width: 100%;
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-3) var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .url-label {
    font-size: var(--text-xs);
    font-weight: 500;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .url-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
  }

  .url-text {
    font-size: var(--text-sm);
    font-family: monospace;
    color: var(--color-text);
    word-break: break-all;
  }

  .copy-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    padding: var(--space-1) var(--space-2);
    background: transparent;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    font-size: var(--text-xs);
    font-family: var(--font-sans);
    color: var(--color-text-muted);
    cursor: pointer;
    white-space: nowrap;
    flex-shrink: 0;
    transition: all 0.15s ease;
  }

  .copy-btn:hover {
    border-color: var(--color-accent);
    color: var(--color-accent);
  }
</style>
