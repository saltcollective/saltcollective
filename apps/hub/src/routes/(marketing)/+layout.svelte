<script lang="ts">
  import type { Snippet } from 'svelte';
  import { Show, UserButton } from 'svelte-clerk';
  import { BrandLogo, Button, Container } from '@saltcollective/ui';

  const { children }: { children: Snippet } = $props();
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link
    href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<div class="page">
  <header class="header">
    <Container>
      <div class="headerInner">
        <a href="/" class="logo" aria-label="Salt Collective home">
          <BrandLogo height={55} />
        </a>
        <nav class="nav" aria-label="Main">
          <a href="/#features" class="navLink">What you get</a>
          <a href="/#how" class="navLink">How it works</a>
          <a href="/#pricing" class="navLink">The price</a>
          <a href="/#contact" class="navLink">Say hi</a>
        </nav>
        <div class="actions">
          <Show when="signed-out">
            <Button variant="ghost" size="sm" href="/sign-in">Sign in</Button>
            <Button size="sm" href="/sign-up">Start your hub</Button>
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
        <nav class="footerLinks">
          <a href="/#features">What you get</a>
          <a href="/#how">How it works</a>
          <a href="/#pricing">The price</a>
          <a href="/privacy">Privacy</a>
          <a href="/#contact">Email us</a>
        </nav>
        <span>© 2026 — made with care, in small batches.</span>
      </div>
    </Container>
  </footer>
</div>

<style>
  /* ---- Marketing-only CSS vars (paper, tape, ink) ---- */
  /* These alias the updated tokens and add decoration-layer vars  */
  :global(:root) {
    --paper: var(--color-bg);
    --paper-2: var(--color-surface);
    --paper-card: var(--color-surface-2);
    --paper-card-2: #42413c;
    --tape: #f4a27e;
    --tape-edge: #e3906c;
    --tape-ink: #1a1a1f;
    --ink: var(--color-text);
    --pin: #e05252;
    --highlighter: #d4a838;
  }

  @media (prefers-color-scheme: light) {
    :global(:root) {
      --paper-card-2: #fffefa;
      --tape: #f4d9b3;
      --tape-edge: #e8c594;
      --pin: #c94545;
      --highlighter: #ffe680;
    }
  }

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
    background: color-mix(in srgb, var(--color-bg) 88%, transparent);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px dashed color-mix(in srgb, var(--color-text) 18%, transparent);
  }

  .headerInner {
    display: flex;
    align-items: center;
    height: 78px;
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
    margin-top: 41px;
  }

  .navLink {
    font-size: var(--text-sm);
    color: color-mix(in srgb, var(--color-text) 65%, transparent);
    text-decoration: none;
    transition: color 0.15s ease;
    position: relative;
  }

  .navLink:hover {
    color: var(--color-text);
  }

  .navLink:hover::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: -4px;
    height: 6px;
    background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 6' preserveAspectRatio='none'><path d='M1,4 C20,1 40,5 79,3' fill='none' stroke='%2368B7D2' stroke-width='1.6' stroke-linecap='round'/></svg>")
      center / 100% 100% no-repeat;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    margin-left: auto;
    margin-top: 41px;
  }

  /* ---- Main ---- */
  .main {
    flex: 1;
  }

  /* ---- Footer ---- */
  .footer {
    border-top: 1px dashed color-mix(in srgb, var(--color-text) 18%, transparent);
    padding-block: var(--space-8);
    font-size: var(--text-sm);
    color: color-mix(in srgb, var(--color-text) 55%, transparent);
  }

  .footerInner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: var(--space-4);
  }

  .footerBrand {
    font-weight: 600;
    color: var(--color-text);
  }

  .footerLinks {
    display: flex;
    gap: var(--space-5);
  }

  .footerLinks a {
    color: inherit;
    text-decoration: none;
  }

  .footerLinks a:hover {
    color: var(--color-text);
  }
</style>
