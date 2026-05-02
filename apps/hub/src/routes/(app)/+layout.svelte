<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { LayoutData } from './$types';
  import { page } from '$app/state';
  import Sidebar from '$lib/components/Sidebar.svelte';

  let { data, children }: { data: LayoutData; children: Snippet } = $props();

  let drawerOpen = $state(false);
</script>

<div class="shell" class:drawerOpen>
  <!-- Mobile top bar -->
  <div class="mobileBar">
    <button
      class="iconBtn"
      type="button"
      aria-label="Open navigation"
      onclick={() => (drawerOpen = true)}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
           stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    </button>
    <span class="mobileTitle">{data.club.name}</span>
  </div>

  <!-- Sidebar -->
  <Sidebar
    club={data.club}
    activeRoute={page.url.pathname}
    open={drawerOpen}
    onClose={() => (drawerOpen = false)}
  />

  <!-- Scrim (mobile) -->
  <div
    class="scrim"
    role="presentation"
    onclick={() => (drawerOpen = false)}
  ></div>

  <!-- Main content -->
  <main class="main">
    {@render children()}
  </main>
</div>

<style>
  .shell {
    display: grid;
    grid-template-columns: 240px 1fr;
    min-height: 100vh;
  }

  .mobileBar {
    display: none;
  }

  .scrim {
    display: none;
  }

  .main {
    min-width: 0;
  }

  /* ---- Mobile ---- */
  @media (max-width: 820px) {
    .shell {
      grid-template-columns: 1fr;
    }

    .mobileBar {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      position: sticky;
      top: 0;
      z-index: 40;
      grid-column: 1;
      padding: var(--space-3) var(--space-4);
      background: color-mix(in srgb, var(--color-bg) 85%, transparent);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--color-border);
    }

    .mobileTitle {
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--color-text);
    }

    .iconBtn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background: transparent;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      color: var(--color-text);
      cursor: pointer;
      padding: 0;
      flex-shrink: 0;
      transition: background-color 0.15s ease;
    }

    .iconBtn:hover {
      background: var(--color-surface-2);
    }

    .iconBtn svg {
      width: 20px;
      height: 20px;
      display: block;
    }

    .scrim {
      display: block;
      position: fixed;
      inset: 0;
      z-index: 50;
      background: color-mix(in srgb, #000 55%, transparent);
      backdrop-filter: blur(2px);
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s ease;
    }

    .shell.drawerOpen .scrim {
      opacity: 1;
      pointer-events: auto;
    }

    .shell.drawerOpen {
      overflow: hidden;
    }

    .main {
      grid-column: 1;
    }
  }
</style>
