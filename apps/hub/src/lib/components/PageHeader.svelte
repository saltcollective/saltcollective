<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    title: string;
    subtitle?: string;
    action?: Snippet;
  }

  let { title, subtitle, action }: Props = $props();
</script>

<header class="header">
  <div>
    <h1 class="title">{title}</h1>
    {#if subtitle}<p class="subtitle">{subtitle}</p>{/if}
  </div>
  {#if action}
    <div class="action">{@render action()}</div>
  {/if}
</header>

<style>
  .header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-4);
  }

  .title {
    font-size: 1.75rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--color-text);
    margin: 0 0 var(--space-2);
    line-height: 1.2;
  }

  .subtitle {
    color: var(--color-text-muted);
    font-size: var(--text-base);
    margin: 0;
  }

  @media (max-width: 820px) {
    .header {
      flex-wrap: wrap;
    }

    .action {
      width: 100%;
    }

    .action :global(a),
    .action :global(button) {
      width: 100%;
      justify-content: center;
    }

    .title {
      font-size: 1.5rem;
    }
  }
</style>
