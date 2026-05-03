<script lang="ts">
  import { Badge, Button } from '@saltcollective/ui';
  import PageHeader from '$lib/components/PageHeader.svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  let activeFilter = $state<string | null>(null);

  const visible = $derived(
    activeFilter === null
      ? data.businesses
      : data.businesses.filter((b) => b.sponsorTier.id === activeFilter)
  );
</script>

<div class="screen">
  <PageHeader
    title="Sponsors"
    subtitle="Manage the businesses listed on your hub."
  >
    {#snippet action()}
      <Button size="sm" href="/dashboard/sponsors/new">Add sponsor</Button>
    {/snippet}
  </PageHeader>

  {#if data.tiers.length > 0}
    <div class="filterBar">
      <button
        class="chip"
        class:active={activeFilter === null}
        onclick={() => (activeFilter = null)}
      >All</button>
      {#each data.tiers as tier}
        <button
          class="chip"
          class:active={activeFilter === tier.id}
          onclick={() => (activeFilter = tier.id)}
        >{tier.name}</button>
      {/each}
    </div>
  {/if}

  <section class="card">
    {#if visible.length === 0}
      <p class="empty">
        {activeFilter === null ? 'No sponsors yet.' : 'No sponsors in this tier yet.'}
      </p>
    {:else}
      <table class="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Tier</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {#each visible as business}
            <tr>
              <td>
                <div class="rowMain">
                  <div class="avatar">{business.name[0].toUpperCase()}</div>
                  <span class="rowTitle">{business.name}</span>
                </div>
              </td>
              <td class="muted">{business.sponsorTier.name}</td>
              <td>
                <Badge variant={business.isActive ? 'success' : 'default'}>
                  {business.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </td>
              <td class="actionCell">
                <Button variant="ghost" size="sm" href="/dashboard/sponsors/{business.id}/edit">Edit</Button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
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

  /* ---- Filter chips ---- */
  .filterBar {
    display: flex;
    gap: var(--space-2);
    flex-wrap: wrap;
  }

  .chip {
    background: transparent;
    border: 1px solid var(--color-border);
    color: var(--color-text-muted);
    font-family: var(--font-sans);
    font-size: var(--text-sm);
    font-weight: 500;
    padding: var(--space-2) var(--space-4);
    border-radius: var(--radius-full);
    cursor: pointer;
    transition: color 0.15s, background 0.15s, border-color 0.15s;
  }

  .chip:hover {
    color: var(--color-text);
  }

  .chip.active {
    background: var(--color-surface-2);
    color: var(--color-text);
    border-color: var(--color-accent);
  }

  /* ---- Card + table ---- */
  .card {
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    overflow: hidden;
  }

  .table {
    width: 100%;
    border-collapse: collapse;
    font-size: var(--text-sm);
  }

  .table th {
    text-align: left;
    padding: var(--space-3) var(--space-5);
    font-size: var(--text-xs);
    font-weight: 700;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    border-bottom: 1px solid var(--color-border);
  }

  .table td {
    padding: var(--space-3) var(--space-5);
    border-bottom: 1px solid var(--color-border);
    vertical-align: middle;
  }

  .table tr:last-child td {
    border-bottom: none;
  }

  .rowMain {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .avatar {
    width: 28px;
    height: 28px;
    border-radius: var(--radius-md);
    background: color-mix(in srgb, var(--color-accent) 20%, transparent);
    color: var(--color-accent);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: var(--text-xs);
    flex-shrink: 0;
  }

  .rowTitle {
    font-weight: 600;
    color: var(--color-text);
  }

  .muted {
    color: var(--color-text-muted);
  }

  .actionCell {
    text-align: right;
  }

  .empty {
    padding: var(--space-8);
    text-align: center;
    color: var(--color-text-muted);
    font-size: var(--text-sm);
    margin: 0;
  }

  @media (max-width: 820px) {
    .screen {
      padding: var(--space-6) var(--space-4);
      gap: var(--space-5);
    }

    .filterBar {
      flex-wrap: nowrap;
      overflow-x: auto;
      margin: 0 calc(var(--space-4) * -1);
      padding: 0 var(--space-4);
      scrollbar-width: none;
    }

    .filterBar::-webkit-scrollbar {
      display: none;
    }

    .chip {
      flex: 0 0 auto;
    }

    /* Reflow table to card rows */
    .table thead {
      display: none;
    }

    .table,
    .table tbody,
    .table tr,
    .table td {
      display: block;
      width: 100%;
    }

    .table tr {
      padding: var(--space-4);
      border-bottom: 1px solid var(--color-border);
      display: grid;
      grid-template-columns: 1fr auto;
      grid-template-areas:
        'name   status'
        'tier   action';
      column-gap: var(--space-3);
      row-gap: var(--space-2);
      align-items: center;
    }

    .table tr:last-child {
      border-bottom: none;
    }

    .table td {
      padding: 0;
      border-bottom: none;
    }

    .table td:nth-child(1) { grid-area: name; }
    .table td:nth-child(2) { grid-area: tier; font-size: var(--text-xs); }
    .table td:nth-child(3) { grid-area: status; justify-self: end; }
    .table td:nth-child(4) { grid-area: action; }

    .actionCell {
      text-align: left;
    }
  }
</style>
