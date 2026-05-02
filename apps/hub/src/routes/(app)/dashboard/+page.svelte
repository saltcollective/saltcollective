<script lang="ts">
  import { Badge, Stat } from '@saltcollective/ui';
  import PageHeader from '$lib/components/PageHeader.svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<div class="screen">
  <PageHeader
    title="Dashboard"
    subtitle="An overview of your sponsor hub."
  />

  <div class="stats">
    <Stat label="Total sponsors" value={data.stats.total} />
    <Stat label="Active" value={data.stats.active} />
    <Stat label="Inactive" value={data.stats.inactive} />
    <Stat label="Views this month" value={data.stats.viewsThisMonth} />
  </div>

  <section class="card">
    <header class="cardHeader">
      <h2 class="cardTitle">Recent sponsors</h2>
      <a href="/sponsors" class="cardLink">View all</a>
    </header>

    {#if data.recent.length === 0}
      <p class="empty">No sponsors yet. <a href="/sponsors">Add your first one.</a></p>
    {:else}
      <ul class="list">
        {#each data.recent as business}
          <li class="row">
            <div class="rowMain">
              <div class="avatar">{business.name[0].toUpperCase()}</div>
              <div>
                <div class="rowTitle">{business.name}</div>
                <div class="rowSub">{business.sponsorTier.name}</div>
              </div>
            </div>
            <Badge variant={business.isActive ? 'success' : 'default'}>
              {business.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </li>
        {/each}
      </ul>
    {/if}
  </section>
</div>

<style>
  .screen {
    padding: var(--space-8) var(--space-10);
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  .stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--space-4);
  }

  .card {
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-5) var(--space-6);
  }

  .cardHeader {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-4);
  }

  .cardTitle {
    font-size: var(--text-lg);
    font-weight: 700;
    color: var(--color-text);
    letter-spacing: -0.01em;
    margin: 0;
  }

  .cardLink {
    font-size: var(--text-sm);
    color: var(--color-accent);
    text-decoration: none;
  }

  .cardLink:hover {
    opacity: 0.85;
  }

  .list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
  }

  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-3) 0;
    border-top: 1px solid var(--color-border);
  }

  .row:first-child {
    border-top: none;
    padding-top: 0;
  }

  .rowMain {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .avatar {
    width: 36px;
    height: 36px;
    border-radius: var(--radius-md);
    background: color-mix(in srgb, var(--color-accent) 20%, transparent);
    color: var(--color-accent);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: var(--text-sm);
    flex-shrink: 0;
  }

  .rowTitle {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--color-text);
  }

  .rowSub {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    margin-top: 2px;
  }

  .empty {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    margin: 0;
    padding: var(--space-4) 0;
  }

  .empty a {
    color: var(--color-accent);
  }

  @media (max-width: 820px) {
    .screen {
      padding: var(--space-6) var(--space-4);
      gap: var(--space-5);
    }

    .stats {
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-3);
    }
  }

  @media (max-width: 420px) {
    .stats {
      grid-template-columns: 1fr;
    }
  }
</style>
