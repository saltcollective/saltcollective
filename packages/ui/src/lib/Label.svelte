<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    required?: boolean;
    class?: string;
    children?: Snippet;
    [key: string]: unknown;
  }

  let { required = false, class: className = '', children, ...restProps }: Props = $props();
</script>

<label class="label {required ? 'required' : ''} {className}" {...restProps}>
  {@render children?.()}
</label>

<style>
  .label {
    display: block;
    font-family: var(--font-sans);
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--color-text-muted);
    margin-bottom: var(--space-1);
  }

  .required::after {
    content: ' *';
    color: var(--color-destructive);
  }
</style>
