<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    cols?: number | string;
    gap?: string;
    rowGap?: string;
    colGap?: string;
    as?: string;
    class?: string;
    children?: Snippet;
  }

  let {
    cols = 12,
    gap = 'var(--space-4)',
    rowGap,
    colGap,
    as = 'div',
    class: className = '',
    children,
  }: Props = $props();

  const templateColumns = $derived(
    typeof cols === 'number' ? `repeat(${cols}, 1fr)` : cols
  );

  const useShorthandGap = $derived(!rowGap && !colGap);
</script>

<svelte:element
  this={as}
  class="grid {className}"
  style:grid-template-columns={templateColumns}
  style:gap={useShorthandGap ? gap : undefined}
  style:row-gap={!useShorthandGap ? (rowGap ?? gap) : undefined}
  style:column-gap={!useShorthandGap ? (colGap ?? gap) : undefined}
>
  {@render children?.()}
</svelte:element>

<style>
  .grid {
    display: grid;
  }
</style>
