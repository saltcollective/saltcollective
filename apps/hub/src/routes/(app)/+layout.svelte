<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { LayoutData } from './$types';
  import { page } from '$app/state';
  import { AppSidebar } from '@saltcollective/ui';

  let { data, children }: { data: LayoutData; children: Snippet } = $props();

  let drawerOpen = $state(false);
  let collapsed = $state(false);

  // Tiers, Team and Settings are ADMIN-only (enforced server-side via 403 guards)
  const navSections = $derived([
    {
      items: [
        { href: '/dashboard',           label: 'Dashboard', icon: 'grid',    exact: true },
        { href: '/dashboard/sponsors',  label: 'Sponsors',  icon: 'tag' },
        ...(data.role === 'ADMIN' ? [{ href: '/dashboard/tiers', label: 'Tiers', icon: 'layers' }] : []),
        { href: '/dashboard/analytics', label: 'Analytics', icon: 'chart' },
        { href: '/dashboard/embed',     label: 'Embed',     icon: 'code' },
        ...(data.role === 'ADMIN'
          ? [
              { href: '/dashboard/team',     label: 'Team',     icon: 'users' },
              { href: '/dashboard/settings', label: 'Settings', icon: 'sliders' },
            ]
          : []),
      ],
    },
  ]);
</script>

{#if data.impersonating}
  <div class="impersonation-banner">
    <span>
      Impersonating <strong>{data.club.name}</strong> — changes affect the real club and are
      recorded in the audit log.
    </span>
    <form method="POST" action="/api/impersonation/stop">
      <button type="submit">End impersonation</button>
    </form>
  </div>
{/if}

<div class="shell" class:collapsed class:drawerOpen>
  <!-- Mobile top bar -->
  <div class="mobileBar">
    <button
      class="iconBtn"
      type="button"
      aria-label="Open navigation"
      onclick={() => (drawerOpen = true)}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    </button>
    <span class="mobileTitle">{data.club.name}</span>
  </div>

  <!-- Sidebar -->
  <AppSidebar
    sections={navSections}
    identity={{ name: data.club.name, subtitle: 'Club admin' }}
    footerLink={{ href: `/${data.club.slug}`, label: 'View public hub', external: true }}
    activeRoute={page.url.pathname}
    {collapsed}
    onToggle={() => (collapsed = !collapsed)}
    open={drawerOpen}
    onClose={() => (drawerOpen = false)}
  />

  <!-- Scrim (mobile) -->
  <div class="scrim" role="presentation" onclick={() => (drawerOpen = false)}></div>

  <!-- Main content -->
  <main class="main">
    {@render children()}
  </main>
</div>

<style>
  .impersonation-banner {
    position: sticky;
    top: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-4);
    padding: var(--space-2) var(--space-4);
    background: color-mix(in srgb, var(--color-warning, #f59e0b) 22%, var(--color-bg));
    border-bottom: 1px solid color-mix(in srgb, var(--color-warning, #f59e0b) 45%, transparent);
    color: var(--color-text);
    font-size: var(--text-sm);
  }

  .impersonation-banner strong {
    font-weight: 700;
  }

  .impersonation-banner button {
    height: 28px;
    padding: 0 var(--space-3);
    background: var(--color-text);
    color: var(--color-bg);
    border: none;
    border-radius: var(--radius-md);
    font-family: var(--font-sans);
    font-size: var(--text-xs);
    font-weight: 700;
    cursor: pointer;
  }

  .impersonation-banner button:hover {
    opacity: 0.85;
  }

  .shell {
    display: grid;
    grid-template-columns: 240px 1fr;
    min-height: 100vh;
    transition: grid-template-columns 0.2s ease;
  }

  .shell.collapsed {
    grid-template-columns: 64px 1fr;
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
    .shell,
    .shell.collapsed {
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
