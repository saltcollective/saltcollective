<script lang="ts">
  import { BrandLogo } from '@saltcollective/ui';

  interface Club {
    name: string;
    logoUrl?: string | null;
  }

  interface Props {
    club: Club;
    activeRoute: string;
    open: boolean;
    onClose: () => void;
  }

  let { club, activeRoute, open, onClose }: Props = $props();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/sponsors', label: 'Sponsors' },
    { href: '/tiers', label: 'Tiers' },
    { href: '/analytics', label: 'Analytics' },
    { href: '/embed', label: 'Embed' },
    { href: '/settings', label: 'Settings' },
  ];

  const initial = $derived(club.name[0]?.toUpperCase() ?? '?');
</script>

<aside class="sidebar" class:open aria-label="Primary navigation">
  <button class="closeBtn" type="button" aria-label="Close menu" onclick={onClose}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  </button>

  <a href="/" class="brand" aria-label="Salt Collective home">
    <BrandLogo height={20} />
  </a>

  <nav class="nav">
    {#each navItems as item}
      <a
        href={item.href}
        class="navItem"
        class:active={activeRoute === item.href || activeRoute.startsWith(item.href + '/')}
        onclick={onClose}
      >
        {item.label}
      </a>
    {/each}
  </nav>

  <div class="footer">
    <div class="club">
      <div class="clubMark">{initial}</div>
      <div>
        <div class="clubName">{club.name}</div>
        <div class="clubSub">Club admin</div>
      </div>
    </div>
  </div>
</aside>

<style>
  .sidebar {
    background: var(--color-surface);
    border-right: 1px solid var(--color-border);
    padding: var(--space-5) var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
    position: relative;
  }

  .closeBtn {
    display: none;
  }

  .brand {
    display: flex;
    align-items: center;
    padding: var(--space-1) var(--space-2);
    text-decoration: none;
  }

  .nav {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    flex: 1;
  }

  .navItem {
    text-align: left;
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--color-text-muted);
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-md);
    text-decoration: none;
    transition: color 0.15s, background 0.15s;
  }

  .navItem:hover {
    background: var(--color-surface-2);
    color: var(--color-text);
  }

  .navItem.active {
    background: var(--color-surface-2);
    color: var(--color-text);
    border: 1px solid var(--color-border);
  }

  .footer {
    border-top: 1px solid var(--color-border);
    padding-top: var(--space-4);
  }

  .club {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .clubMark {
    width: 32px;
    height: 32px;
    border-radius: var(--radius-full);
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--text-sm);
    font-weight: 700;
    color: var(--color-text);
    flex-shrink: 0;
  }

  .clubName {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--color-text);
  }

  .clubSub {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
  }

  /* ---- Mobile drawer ---- */
  @media (max-width: 820px) {
    .sidebar {
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      width: min(280px, 84vw);
      z-index: 60;
      transform: translateX(-100%);
      transition: transform 0.22s ease;
      box-shadow: var(--shadow-md);
    }

    .sidebar.open {
      transform: translateX(0);
    }

    .closeBtn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      position: absolute;
      top: var(--space-3);
      right: var(--space-3);
      width: 36px;
      height: 36px;
      background: transparent;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      color: var(--color-text-muted);
      cursor: pointer;
      padding: 0;
    }

    .closeBtn:hover {
      background: var(--color-surface-2);
      color: var(--color-text);
    }

    .closeBtn svg {
      width: 18px;
      height: 18px;
    }
  }
</style>
