<script lang="ts">
  import { BrandLogo } from '@saltcollective/ui';

  interface Props {
    activeRoute: string;
    collapsed: boolean;
    onToggle: () => void;
    open: boolean;
    onClose: () => void;
    user: { email: string; username: string | null };
  }

  let { activeRoute, collapsed, onToggle, open, onClose, user }: Props = $props();

  const sections = [
    {
      label: 'Overview',
      items: [
        { href: '/admin/dashboard', label: 'Dashboard', icon: 'grid' },
        { href: '/admin/analytics', label: 'Analytics', icon: 'chart' },
      ],
    },
    {
      label: 'Manage',
      items: [
        { href: '/admin/clubs',   label: 'Clubs',   icon: 'building' },
        { href: '/admin/users',   label: 'Users',   icon: 'users' },
        { href: '/admin/billing', label: 'Billing', icon: 'card' },
      ],
    },
  ];

  function iconPath(name: string): string {
    switch (name) {
      case 'grid':
        return '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>';
      case 'chart':
        return '<path d="M3 3v18h18"/><path d="M7 15l4-4 4 3 5-7"/>';
      case 'building':
        return '<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2"/>';
      case 'users':
        return '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3 3-5 6-5s6 2 6 5"/><circle cx="17" cy="9" r="2.5"/><path d="M21 19c0-2-2-4-4-4"/>';
      case 'card':
        return '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/>';
      default:
        return '';
    }
  }

  const initials = $derived(
    user.username
      ? user.username.slice(0, 2).toUpperCase()
      : user.email.split('@')[0].slice(0, 2).toUpperCase()
  );

  const displayName = $derived(user.username ?? user.email.split('@')[0]);
</script>

<aside class="sidebar" class:collapsed class:open aria-label="Admin navigation">
  <button class="closeBtn" type="button" aria-label="Close menu" onclick={onClose}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  </button>

  <div class="brand">
    {#if collapsed}
      <div class="brandMark">S</div>
    {:else}
      <a href="/" class="brandLink" aria-label="Salt Collective home">
        <BrandLogo height={20} />
      </a>
      <span class="brandTag">Admin</span>
    {/if}
  </div>

  <nav class="nav">
    {#each sections as section}
      <div class="section">
        {#if !collapsed}
          <div class="sectionLabel">{section.label}</div>
        {/if}
        {#each section.items as item}
          {@const isActive = activeRoute === item.href || activeRoute.startsWith(item.href + '/')}
          <a
            href={item.href}
            class="navitem"
            class:active={isActive}
            title={collapsed ? item.label : undefined}
            onclick={onClose}
          >
            <span class="navicon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="1.7"
                   stroke-linecap="round" stroke-linejoin="round">
                {@html iconPath(item.icon)}
              </svg>
            </span>
            {#if !collapsed}
              <span class="navlabel">{item.label}</span>
            {/if}
          </a>
        {/each}
      </div>
    {/each}
  </nav>

  <div class="foot">
    <div class="staff">
      <div class="avatar">{initials}</div>
      {#if !collapsed}
        <div class="meta">
          <div class="staffName">{displayName}</div>
          <div class="staffRole">Salt Collective · Admin</div>
        </div>
      {/if}
    </div>
    <button
      class="toggleBtn"
      type="button"
      onclick={onToggle}
      aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
    >
      {#if collapsed}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M13 17l5-5-5-5M6 17l5-5-5-5"/>
        </svg>
      {:else}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11 17l-5-5 5-5M18 17l-5-5 5-5"/>
        </svg>
      {/if}
    </button>
  </div>
</aside>

<style>
  .sidebar {
    background: var(--color-surface);
    border-right: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;
    padding: var(--space-5) var(--space-3);
    gap: var(--space-5);
    overflow: hidden;
    position: relative;
  }

  .closeBtn { display: none; }

  /* ---------- Brand ---------- */
  .brand {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-1) var(--space-2);
    min-height: 28px;
  }

  .brandLink {
    display: flex;
    align-items: center;
    text-decoration: none;
  }

  .brandMark {
    width: 28px;
    height: 28px;
    border-radius: var(--radius-md);
    background: color-mix(in srgb, var(--color-accent) 18%, var(--color-surface-2));
    color: var(--color-accent);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: var(--text-sm);
    flex-shrink: 0;
  }

  .brandTag {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--color-text-muted);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    padding: 2px 6px;
    background: var(--color-surface-2);
    white-space: nowrap;
  }

  /* ---------- Nav ---------- */
  .nav {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    flex: 1;
  }

  .section {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .sectionLabel {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--color-text-muted);
    padding: 0 var(--space-2);
    margin: var(--space-1) 0 var(--space-1);
  }

  .navitem {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    background: transparent;
    border: 1px solid transparent;
    text-align: left;
    cursor: pointer;
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--color-text-muted);
    text-decoration: none;
    transition: background 0.15s, color 0.15s, border-color 0.15s;
  }

  .navitem:hover {
    background: var(--color-surface-2);
    color: var(--color-text);
  }

  .navitem.active {
    background: var(--color-surface-2);
    color: var(--color-text);
    border-color: var(--color-border);
  }

  .navicon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    color: var(--color-text-muted);
  }

  .navitem.active .navicon {
    color: var(--color-accent);
  }

  .navlabel { flex: 1; }

  /* ---------- Collapsed nav ---------- */
  .collapsed .navitem {
    justify-content: center;
    padding: var(--space-2);
  }

  .collapsed .sectionLabel {
    height: 1px;
    background: var(--color-border);
    padding: 0;
    margin: var(--space-2) 0;
    overflow: hidden;
    color: transparent;
  }

  /* ---------- Footer ---------- */
  .foot {
    border-top: 1px solid var(--color-border);
    padding-top: var(--space-3);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
  }

  .collapsed .foot {
    flex-direction: column;
    align-items: center;
  }

  .staff {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    min-width: 0;
    flex: 1;
  }

  .avatar {
    width: 32px;
    height: 32px;
    border-radius: var(--radius-full);
    background: color-mix(in srgb, var(--color-accent) 22%, var(--color-surface-2));
    color: var(--color-accent);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    flex-shrink: 0;
  }

  .meta { line-height: 1.2; min-width: 0; }
  .staffName { font-size: var(--text-sm); font-weight: 600; color: var(--color-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .staffRole { font-size: 11px; color: var(--color-text-muted); }

  .toggleBtn {
    background: transparent;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    color: var(--color-text-muted);
    cursor: pointer;
    padding: 4px 6px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: background 0.15s, color 0.15s;
  }

  .toggleBtn:hover {
    background: var(--color-surface-2);
    color: var(--color-text);
  }

  /* ---------- Mobile drawer ---------- */
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

    .sidebar.open { transform: translateX(0); }

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

    .closeBtn svg { width: 18px; height: 18px; }

    .toggleBtn { display: none; }

    .collapsed .navitem {
      justify-content: flex-start;
      padding: var(--space-2) var(--space-3);
    }

    .collapsed .sectionLabel {
      height: auto;
      background: none;
      padding: 0 var(--space-2);
      margin: var(--space-1) 0;
      color: var(--color-text-muted);
    }
  }
</style>
