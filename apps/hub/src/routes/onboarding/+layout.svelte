<script lang="ts">
  import '$lib/onboarding.css';
  import { BrandLogo } from '@saltcollective/ui';
  import type { Snippet } from 'svelte';
  import { page } from '$app/state';

  let { children }: { children: Snippet } = $props();

  const steps = [
    { label: 'Club',     path: '/onboarding/club' },
    { label: 'Branding', path: '/onboarding/branding' },
    { label: 'Tiers',    path: '/onboarding/tiers' },
    { label: 'Payment',  path: '/onboarding/payment' },
    { label: 'Done',     path: '/onboarding/done' },
  ];

  const currentStep = $derived(
    steps.findIndex((s) => page.url.pathname.startsWith(s.path)) + 1,
  );
</script>

<div class="page">
  <header class="brand">
    <BrandLogo height={28} />
  </header>

  <div class="card">
    <nav class="progress" aria-label="Setup progress">
      {#each steps as step, i}
        {@const num = i + 1}
        {@const done = num < currentStep}
        {@const active = num === currentStep}
        <div class="step" class:done class:active>
          <div class="dot">
            {#if done}
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
                   stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <path d="M2 5l2.5 2.5L8 2" />
              </svg>
            {:else}
              {num}
            {/if}
          </div>
          <span class="stepLabel">{step.label}</span>
        </div>
        {#if i < steps.length - 1}
          <div class="connector" class:done={num < currentStep}></div>
        {/if}
      {/each}
    </nav>

    {@render children()}
  </div>
</div>

<style>
  .page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: var(--space-8) var(--space-4) var(--space-12);
    gap: var(--space-8);
    background: var(--color-bg);
  }

  .brand { flex-shrink: 0; }

  .card {
    width: 100%;
    max-width: 520px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-8);
    display: flex;
    flex-direction: column;
    gap: var(--space-8);
  }

  .progress {
    display: flex;
    align-items: flex-start;
  }

  .step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-1);
    flex-shrink: 0;
  }

  .dot {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 2px solid var(--color-border);
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 600;
    color: var(--color-text-muted);
    transition: all 0.2s ease;
    flex-shrink: 0;
  }

  .step.done .dot {
    background: var(--color-accent);
    border-color: var(--color-accent);
    color: var(--color-accent-fg);
  }

  .step.active .dot {
    border-color: var(--color-accent);
    color: var(--color-accent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent) 20%, transparent);
  }

  .stepLabel {
    font-size: 10px;
    font-weight: 500;
    color: var(--color-text-muted);
    white-space: nowrap;
  }

  .step.active .stepLabel {
    color: var(--color-text);
    font-weight: 600;
  }

  .connector {
    flex: 1;
    height: 2px;
    background: var(--color-border);
    margin-top: 13px;
    transition: background 0.2s ease;
  }

  .connector.done { background: var(--color-accent); }

  @media (max-width: 420px) {
    .card { padding: var(--space-6) var(--space-4); }
    .stepLabel { display: none; }
  }
</style>
