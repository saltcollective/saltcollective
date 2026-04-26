<script lang="ts">
  import type { Snippet } from 'svelte';

  type Variant = 'default' | 'success' | 'warning' | 'destructive';

  interface Props {
    variant?: Variant;
    class?: string;
    children?: Snippet;
  }

  let { variant = 'default', class: className = '', children }: Props = $props();
</script>

<span class="badge {variant} {className}">
  {@render children?.()}
</span>

<style>
  .badge {
    display: inline-flex;
    align-items: center;
    padding: var(--space-1) var(--space-3);
    border-radius: var(--radius-full);
    font-family: var(--font-sans);
    font-size: var(--text-xs);
    font-weight: 600;
    line-height: var(--leading-tight);
    white-space: nowrap;
  }

  .default {
    background: var(--color-surface-2);
    color: var(--color-text-muted);
    border: 1px solid var(--color-border);
  }

  .success {
    background: color-mix(in srgb, var(--color-success) 15%, transparent);
    color: var(--color-success);
  }

  .warning {
    background: color-mix(in srgb, var(--color-warning) 15%, transparent);
    color: var(--color-warning);
  }

  .destructive {
    background: color-mix(in srgb, var(--color-destructive) 15%, transparent);
    color: var(--color-destructive);
  }
</style>
