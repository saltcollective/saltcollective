<script lang="ts">
  import type { Snippet } from 'svelte';

  type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';
  type Size = 'sm' | 'md' | 'lg';

  interface Props {
    variant?: Variant;
    size?: Size;
    href?: string;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    class?: string;
    children?: Snippet;
    onclick?: (event: MouseEvent) => void;
    [key: string]: unknown;
  }

  let {
    variant = 'primary',
    size = 'md',
    href,
    disabled = false,
    type = 'button',
    children,
    class: className = '',
    ...restProps
  }: Props = $props();
</script>

{#if href}
  <!-- svelte-ignore a11y_missing_attribute -->
  <a
    {href}
    class="button {variant} {size} {className}"
    aria-disabled={disabled || undefined}
    {...(restProps as Record<string, unknown>)}
  >
    {@render children?.()}
  </a>
{:else}
  <button
    {type}
    {disabled}
    class="button {variant} {size} {className}"
    {...(restProps as Record<string, unknown>)}
  >
    {@render children?.()}
  </button>
{/if}

<style>
  .button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    border: none;
    border-radius: var(--radius-md);
    font-family: var(--font-sans);
    font-weight: 600;
    line-height: var(--leading-tight);
    cursor: pointer;
    text-decoration: none;
    transition: opacity 0.15s ease, background-color 0.15s ease;
    white-space: nowrap;
  }

  .button:disabled,
  .button[aria-disabled='true'] {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  .primary {
    background: var(--color-accent);
    color: var(--color-accent-fg);
  }

  .primary:hover:not(:disabled):not([aria-disabled='true']) {
    opacity: 0.9;
  }

  .secondary {
    background: var(--color-surface-2);
    color: var(--color-text);
    border: 1px solid var(--color-border);
  }

  .secondary:hover:not(:disabled):not([aria-disabled='true']) {
    background: var(--color-border);
  }

  .ghost {
    background: transparent;
    color: var(--color-text);
  }

  .ghost:hover:not(:disabled):not([aria-disabled='true']) {
    background: var(--color-surface-2);
  }

  .destructive {
    background: var(--color-destructive);
    color: var(--color-destructive-fg);
  }

  .destructive:hover:not(:disabled):not([aria-disabled='true']) {
    opacity: 0.9;
  }

  .sm {
    font-size: var(--text-sm);
    padding: var(--space-2) var(--space-3);
  }

  .md {
    font-size: var(--text-base);
    padding: var(--space-3) var(--space-4);
  }

  .lg {
    font-size: var(--text-lg);
    padding: var(--space-4) var(--space-6);
  }
</style>