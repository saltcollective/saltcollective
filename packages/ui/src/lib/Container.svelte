<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    as?: string;
    class?: string;
    children?: Snippet;
  }

  let { as = 'div', class: className = '', children }: Props = $props();
</script>

<svelte:element this={as} class="container {className}">
  {@render children?.()}
</svelte:element>

<style>
  .container {
    width: 100%;
    max-width: 1200px;
    margin-inline: auto;
    padding-inline: var(--space-6);
  }

  @media (max-width: 640px) {
    .container {
      padding-inline: var(--space-4);
    }
  }
</style>
