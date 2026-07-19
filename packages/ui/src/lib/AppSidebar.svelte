<script lang="ts">
  import BrandLogo from './BrandLogo.svelte';

  interface NavItem {
    href: string;
    label: string;
    icon?: string;
    exact?: boolean;
  }

  interface NavSection {
    label?: string;
    items: NavItem[];
  }

  interface Identity {
    name: string;
    subtitle: string;
    initial?: string;
  }

  interface FooterLink {
    href: string;
    label: string;
    external?: boolean;
  }

  interface Switcher {
    label: string;
    options: { label: string; value: string }[];
    current: string;
    action: string;
  }

  interface Props {
    activeRoute: string;
    sections: NavSection[];
    identity: Identity;
    open: boolean;
    onClose: () => void;
    collapsed?: boolean;
    onToggle?: () => void;
    tag?: string;
    footerLink?: FooterLink;
    switcher?: Switcher;
  }

  let {
    activeRoute,
    sections,
    identity,
    open,
    onClose,
    collapsed = false,
    onToggle,
    tag,
    footerLink,
    switcher,
  }: Props = $props();

  const initial = $derived(identity.initial ?? identity.name[0]?.toUpperCase() ?? '?');

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
      case 'tag':
        return '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>';
      case 'layers':
        return '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>';
      case 'code':
        return '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>';
      case 'sliders':
        return '<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>';
      default:
        return '';
    }
  }
</script>

<aside class="sidebar" class:collapsed class:open aria-label="Navigation">
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
        <BrandLogo fullWidth />
      </a>
      {#if tag}
        <span class="brandTag">{tag}</span>
      {/if}
    {/if}
  </div>

  <nav class="nav">
    {#each sections as section}
      <div class="section">
        {#if section.label && !collapsed}
          <div class="sectionLabel">{section.label}</div>
        {/if}
        {#each section.items as item}
          {@const isActive = item.exact
            ? activeRoute === item.href
            : activeRoute === item.href || activeRoute.startsWith(item.href + '/')}
          <a
            href={item.href}
            class="navItem"
            class:active={isActive}
            title={collapsed ? item.label : undefined}
            onclick={onClose}
          >
            {#if item.icon}
              <span class="navIcon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="1.7"
                     stroke-linecap="round" stroke-linejoin="round">
                  {@html iconPath(item.icon)}
                </svg>
              </span>
            {/if}
            {#if !collapsed}
              <span class="navLabel">{item.label}</span>
            {/if}
          </a>
        {/each}
      </div>
    {/each}
  </nav>

  <div class="footer">
    {#if switcher && !collapsed}
      <form class="switcherForm" method="POST" action={switcher.action}>
        <label class="switcherLabel">
          <span class="switcherLabelText">{switcher.label}</span>
          <select
            class="switcherSelect"
            name="value"
            onchange={(e) => e.currentTarget.form?.submit()}
          >
            {#each switcher.options as option (option.value)}
              <option value={option.value} selected={option.value === switcher.current}>
                {option.label}
              </option>
            {/each}
          </select>
        </label>
      </form>
    {/if}

    {#if footerLink && !collapsed}
      <a
        href={footerLink.href}
        class="footerLink"
        target={footerLink.external ? '_blank' : undefined}
        rel={footerLink.external ? 'noopener noreferrer' : undefined}
        onclick={onClose}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
        {footerLink.label}
        {#if footerLink.external}
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>
        {/if}
      </a>
    {/if}

    <div class="identity">
      <div class="avatar">{initial}</div>
      {#if !collapsed}
        <div class="identityMeta">
          <div class="identityName">{identity.name}</div>
          <div class="identitySubtitle">{identity.subtitle}</div>
        </div>
      {/if}
      {#if onToggle}
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
      {/if}
    </div>
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
    width: 100%;
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
    margin: var(--space-1) 0;
  }

  .navItem {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    border: 1px solid transparent;
    text-align: left;
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--color-text-muted);
    text-decoration: none;
    transition: background 0.15s, color 0.15s, border-color 0.15s;
  }

  .navItem:hover {
    background: var(--color-surface-2);
    color: var(--color-text);
  }

  .navItem.active {
    background: var(--color-surface-2);
    color: var(--color-text);
    border-color: var(--color-border);
  }

  .navIcon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    color: var(--color-text-muted);
  }

  .navItem.active .navIcon {
    color: var(--color-accent);
  }

  .navLabel { flex: 1; }

  /* ---------- Collapsed nav ---------- */
  .collapsed .navItem {
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
  .footer {
    border-top: 1px solid var(--color-border);
    padding-top: var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .switcherForm {
    padding: 0 var(--space-1);
  }

  .switcherLabel {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .switcherLabelText {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--color-text-muted);
    padding: 0 var(--space-1);
  }

  .switcherSelect {
    width: 100%;
    height: 32px;
    padding: 0 var(--space-2);
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    font-family: var(--font-sans);
    font-size: var(--text-sm);
    color: var(--color-text);
    outline: none;
    cursor: pointer;
    transition: border-color 0.15s;
  }

  .switcherSelect:focus {
    border-color: var(--color-accent);
  }

  .footerLink {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--text-xs);
    font-weight: 500;
    color: var(--color-text-muted);
    text-decoration: none;
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-md);
    transition: color 0.15s ease, background-color 0.15s ease;
  }

  .footerLink:hover {
    color: var(--color-accent);
    background: var(--color-surface-2);
  }

  .footerLink svg:last-child {
    margin-left: auto;
    opacity: 0.5;
  }

  .identity {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    min-width: 0;
  }

  .collapsed .identity {
    flex-direction: column;
    align-items: center;
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

  .identityMeta {
    line-height: 1.2;
    min-width: 0;
    flex: 1;
  }

  .identityName {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--color-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .identitySubtitle {
    font-size: 11px;
    color: var(--color-text-muted);
  }

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

    .collapsed .navItem {
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
