<script lang="ts">
  import { Container } from '@saltcollective/ui';
</script>

<svelte:head>
  <title>Account deactivated — Salt Collective</title>
</svelte:head>

<Container>
  <div class="wrap">
    <h1>Account deactivated</h1>
    <p>
      Your Salt Collective account has been deactivated. If you think this is a mistake, contact
      Salt Collective support.
    </p>
    <a href="/">Back to the home page</a>
  </div>
</Container>

<style>
  .wrap {
    min-height: 60vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    gap: var(--space-4);
    padding: var(--space-12) 0;
  }

  h1 {
    font-size: var(--text-2xl, 1.5rem);
    margin: 0;
  }

  p {
    color: var(--color-text-muted);
    font-size: var(--text-sm);
    max-width: 420px;
    margin: 0;
  }

  a {
    color: var(--color-accent);
    font-size: var(--text-sm);
  }
</style>
