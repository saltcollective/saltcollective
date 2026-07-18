<script lang="ts">
  import PageHeader from '$lib/components/PageHeader.svelte';
  import { clubUrl } from '$lib/domain';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  const hubUrl = $derived(clubUrl(data.club.slug));

  // Sizing controls
  let widthMode = $state<'full' | 'fixed'>('full');
  let widthPx = $state(800);
  let heightPx = $state(600);
  let borderRadius = $state(8);

  const widthAttr = $derived(widthMode === 'full' ? '100%' : `${widthPx}px`);

  const embedSnippet = $derived(
    `<iframe\n  src="${hubUrl}"\n  width="${widthAttr}"\n  height="${heightPx}px"\n  style="border: none; border-radius: ${borderRadius}px; display: block;"\n  title="Sponsor hub"\n  loading="lazy"\n></iframe>`
  );

  let copiedUrl = $state(false);
  let copiedEmbed = $state(false);

  function copy(text: string, which: 'url' | 'embed') {
    navigator.clipboard.writeText(text).then(() => {
      if (which === 'url') {
        copiedUrl = true;
        setTimeout(() => (copiedUrl = false), 2000);
      } else {
        copiedEmbed = true;
        setTimeout(() => (copiedEmbed = false), 2000);
      }
    });
  }
</script>

<div class="screen">
  <PageHeader
    title="Embed"
    subtitle="Share your public sponsor hub or embed it on your website."
  />

  <!-- Public hub URL -->
  <section class="card">
    <h2 class="section-title">Public hub URL</h2>
    <p class="section-desc">Your sponsor hub is live at this address. Share it anywhere.</p>
    <div class="copy-row">
      <input class="copy-input" type="text" readonly value={hubUrl} />
      <button class="copy-btn" onclick={() => copy(hubUrl, 'url')}>
        {copiedUrl ? 'Copied!' : 'Copy'}
      </button>
      <a class="view-btn" href={hubUrl} target="_blank" rel="noopener noreferrer">
        View hub
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
          <polyline points="15 3 21 3 21 9"/>
          <line x1="10" y1="14" x2="21" y2="3"/>
        </svg>
      </a>
    </div>
  </section>

  <!-- Embed code -->
  <section class="card">
    <h2 class="section-title">Embed code</h2>
    <p class="section-desc">
      Paste this iframe into your website to display your sponsor hub inline.
    </p>

    <!-- Controls -->
    <div class="controls">
      <div class="control-group">
        <span class="control-label">Width</span>
        <div class="seg-group" role="group" aria-label="Width mode">
          <label class="seg-option" class:seg-active={widthMode === 'full'}>
            <input type="radio" bind:group={widthMode} value="full" class="seg-radio" />
            Full width
          </label>
          <label class="seg-option" class:seg-active={widthMode === 'fixed'}>
            <input type="radio" bind:group={widthMode} value="fixed" class="seg-radio" />
            Fixed
          </label>
        </div>
        {#if widthMode === 'fixed'}
          <div class="px-field">
            <input
              type="number"
              class="px-input"
              bind:value={widthPx}
              min="200"
              max="2000"
              step="10"
            />
            <span class="px-unit">px</span>
          </div>
        {/if}
      </div>

      <div class="control-group">
        <span class="control-label">Height</span>
        <div class="px-field">
          <input
            type="number"
            class="px-input"
            bind:value={heightPx}
            min="200"
            max="2000"
            step="50"
          />
          <span class="px-unit">px</span>
        </div>
      </div>

      <div class="control-group">
        <span class="control-label">Corner radius</span>
        <div class="px-field">
          <input
            type="number"
            class="px-input"
            bind:value={borderRadius}
            min="0"
            max="24"
            step="1"
          />
          <span class="px-unit">px</span>
        </div>
      </div>
    </div>

    <!-- Snippet -->
    <div class="embed-block">
      <pre class="embed-pre">{embedSnippet}</pre>
      <button class="copy-btn embed-copy" onclick={() => copy(embedSnippet, 'embed')}>
        {copiedEmbed ? 'Copied!' : 'Copy'}
      </button>
    </div>
  </section>
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

  .section-title {
    font-size: var(--text-base);
    font-weight: 700;
    color: var(--color-text);
    margin: 0 0 var(--space-2);
  }

  .section-desc {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    margin: 0 0 var(--space-5);
    line-height: var(--leading-normal);
  }

  /* URL row */
  .copy-row {
    display: flex;
    gap: var(--space-2);
    align-items: center;
  }

  .copy-input {
    flex: 1;
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-2) var(--space-3);
    font-size: var(--text-sm);
    font-family: monospace;
    color: var(--color-text);
    min-width: 0;
  }

  .copy-btn {
    flex-shrink: 0;
    padding: var(--space-2) var(--space-4);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    font-weight: 600;
    font-family: var(--font-sans);
    color: var(--color-text);
    cursor: pointer;
    transition: background-color 0.15s ease;
    white-space: nowrap;
  }

  .copy-btn:hover {
    background: var(--color-border);
  }

  .view-btn {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    padding: var(--space-2) var(--space-4);
    background: var(--color-accent);
    border: 1px solid transparent;
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--color-accent-fg);
    text-decoration: none;
    transition: opacity 0.15s ease;
    white-space: nowrap;
  }

  .view-btn:hover {
    opacity: 0.85;
  }

  /* Controls */
  .controls {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-4) var(--space-6);
    margin-bottom: var(--space-5);
    padding: var(--space-4);
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
  }

  .control-group {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .control-label {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--color-text);
    white-space: nowrap;
  }

  /* Segmented control */
  .seg-group {
    display: inline-flex;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    overflow: hidden;
    background: var(--color-surface);
  }

  .seg-option {
    display: flex;
    align-items: center;
    padding: var(--space-1) var(--space-3);
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--color-text-muted);
    cursor: pointer;
    transition: background-color 0.12s ease, color 0.12s ease;
    user-select: none;
    white-space: nowrap;
  }

  .seg-option + .seg-option {
    border-left: 1px solid var(--color-border);
  }

  .seg-active {
    background: var(--color-surface-2);
    color: var(--color-text);
    font-weight: 600;
  }

  .seg-radio {
    position: absolute;
    opacity: 0;
    pointer-events: none;
    width: 0;
    height: 0;
  }

  /* px number fields */
  .px-field {
    display: flex;
    align-items: center;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    overflow: hidden;
    background: var(--color-surface);
  }

  .px-input {
    width: 64px;
    padding: var(--space-1) var(--space-2);
    background: transparent;
    border: none;
    font-size: var(--text-sm);
    font-family: var(--font-sans);
    color: var(--color-text);
    text-align: right;
  }

  .px-input:focus {
    outline: none;
  }

  .px-unit {
    padding: var(--space-1) var(--space-2) var(--space-1) 0;
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    user-select: none;
  }

  /* Snippet block */
  .embed-block {
    position: relative;
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-4);
    padding-right: calc(var(--space-4) + 72px);
  }

  .embed-pre {
    margin: 0;
    font-size: var(--text-xs);
    font-family: monospace;
    color: var(--color-text);
    white-space: pre-wrap;
    word-break: break-all;
    line-height: var(--leading-normal);
  }

  .embed-copy {
    position: absolute;
    top: var(--space-3);
    right: var(--space-3);
  }

  @media (max-width: 820px) {
    .screen {
      padding: var(--space-6) var(--space-4);
    }

    .copy-row {
      flex-wrap: wrap;
    }

    .copy-input {
      width: 100%;
    }

    .controls {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>
