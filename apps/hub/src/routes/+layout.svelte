<script lang="ts">
  import '@saltcollective/ui/tokens.css';
  import type { Snippet } from 'svelte';
  import { ClerkProvider } from 'svelte-clerk';

  const { children }: { children: Snippet } = $props();
</script>

<ClerkProvider signInUrl="/sign-in" signUpUrl="/sign-up">
  {@render children()}
</ClerkProvider>

<style>
  :global(*),
  :global(*::before),
  :global(*::after) {
    box-sizing: border-box;
  }

  :global(body) {
    margin: 0;
    background: var(--color-bg);
    color: var(--color-text);
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  :global(h1),
  :global(h2),
  :global(h3),
  :global(h4),
  :global(h5),
  :global(h6) {
    font-family: var(--font-sans);
  }

  :global(a) {
    color: inherit;
  }
</style>
