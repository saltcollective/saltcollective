<script lang="ts">
  import type { Snippet } from 'svelte';
  import { Show, UserButton } from 'svelte-clerk';
  import { BrandLogo, Button, Container } from '@saltcollective/ui';

  const { children }: { children: Snippet } = $props();
</script>

<div class="page">
  <header class="header">
    <Container>
      <div class="headerInner">
        <a href="/" class="logo" aria-label="Salt Collective home">
          <BrandLogo height={55} />
        </a>
        <nav class="nav" aria-label="Main">
          <a href="/#features" class="navLink">Features</a>
          <a href="/#pricing" class="navLink">Pricing</a>
        </nav>
        <div class="actions">
          <Show when="signed-out">
            <Button variant="ghost" size="sm" href="/sign-in">Sign in</Button>
            <Button size="sm" href="/sign-up">Get started</Button>
          </Show>
          <Show when="signed-in">
            <Button variant="ghost" size="sm" href="/dashboard">Dashboard</Button>
            <UserButton />
          </Show>
        </div>
      </div>
    </Container>
  </header>

  <main class="main">
    {@render children()}
  </main>

  <footer class="footer">
    <Container>
      <div class="footerInner">
        <span class="footerBrand">Salt Collective Club Hub</span>
        <p class="footerCopy">© 2026 Salt Collective. All rights reserved.</p>
      </div>
    </Container>
  </footer>
</div>

<style>
  .page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ---- Header ---- */
  .header {
    position: sticky;
    top: 0;
    z-index: 50;
    background: color-mix(in srgb, var(--color-bg) 85%, transparent);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--color-border);
  }

  .headerInner {
    display: flex;
    align-items: center;
    height: 96px;
    gap: var(--space-8);
  }

  .logo {
    display: flex;
    align-items: center;
    text-decoration: none;
    flex-shrink: 0;
  }

  .nav {
    display: flex;
    gap: var(--space-6);
    flex: 1;
  }

  .navLink {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    margin-top: 32px;
    text-decoration: none;
    transition: color 0.15s ease;
  }

  .navLink:hover {
    color: var(--color-text);
  }

  .actions {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    margin-top: 32px;
    margin-left: auto;
  }

  /* ---- Main ---- */
  .main {
    flex: 1;
  }

  /* ---- Footer ---- */
  .footer {
    border-top: 1px solid var(--color-border);
    padding-block: var(--space-8);
    color: var(--color-text-muted);
    font-size: var(--text-sm);
  }

  .footerInner {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .footerBrand {
    font-weight: 600;
    color: var(--color-text);
  }

  .footerCopy {
    margin: 0;
  }
</style>
