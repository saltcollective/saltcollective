<script lang="ts">
  import { Badge, Button } from '@saltcollective/ui';
  import PageHeader from '$lib/components/PageHeader.svelte';
  import { STATUS_LABEL, STATUS_VARIANT } from '$lib/businessStatus';
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';
  import type { BusinessStatus } from '@saltcollective/schema';
  import type { PageData, ActionData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  // Status filter — seeded from ?status= (e.g. the dashboard's "leads" banner).
  const initialStatus = ($page.url.searchParams.get('status') as BusinessStatus | null) ?? null;
  let statusFilter = $state<BusinessStatus | null>(initialStatus);
  let tierFilter = $state<string | null>(null);

  const STATUS_ORDER: BusinessStatus[] = ['LEAD', 'ACTIVE', 'ARCHIVED', 'DECLINED'];
  const counts = $derived.by(() => {
    const c: Record<string, number> = {};
    for (const b of data.businesses) c[b.status] = (c[b.status] ?? 0) + 1;
    return c;
  });

  const visible = $derived(
    data.businesses.filter(
      (b) =>
        (statusFilter === null || b.status === statusFilter) &&
        (tierFilter === null || b.sponsorTier?.id === tierFilter)
    )
  );

  const moneyFmt = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' });
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

  {#if form?.error}
    <p class="form-error">{form.error}</p>
  {/if}

  <div class="filterBar">
    <button class="chip" class:active={statusFilter === null} onclick={() => (statusFilter = null)}>
      All · {data.businesses.length}
    </button>
    {#each STATUS_ORDER as s}
      {#if (counts[s] ?? 0) > 0}
        <button class="chip" class:active={statusFilter === s} onclick={() => (statusFilter = s)}>
          {STATUS_LABEL[s]} · {counts[s]}
        </button>
      {/if}
    {/each}
  </div>

  {#if data.tiers.length > 0}
    <div class="filterBar secondary">
      <button class="chip" class:active={tierFilter === null} onclick={() => (tierFilter = null)}>
        All tiers
      </button>
      {#each data.tiers as tier}
        <button class="chip" class:active={tierFilter === tier.id} onclick={() => (tierFilter = tier.id)}>
          {tier.name}
        </button>
      {/each}
    </div>
  {/if}

  <section class="card">
    {#if visible.length === 0}
      <p class="empty">No sponsors match this filter.</p>
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
                  <div>
                    <span class="rowTitle">{business.name}</span>
                    {#if business.status === 'LEAD'}
                      <div class="leadMeta">
                        {#if business.contactName}<span>{business.contactName}</span>{/if}
                        {#if business.email}<span>{business.email}</span>{/if}
                        {#if business.confirmationPhone}<span>☎ {business.confirmationPhone}</span>{/if}
                        {#if business.desiredSpend != null}<span>Budget: {moneyFmt.format(business.desiredSpend)}</span>{/if}
                      </div>
                      {#if business.message}<p class="leadMsg">“{business.message}”</p>{/if}
                    {/if}
                  </div>
                </div>
              </td>
              <td class="muted">{business.sponsorTier?.name ?? '—'}</td>
              <td>
                <Badge variant={STATUS_VARIANT[business.status]}>
                  {STATUS_LABEL[business.status]}
                </Badge>
              </td>
              <td class="actionCell">
                <div class="rowActions">
                  <Button variant="ghost" size="sm" href="/dashboard/sponsors/{business.id}/edit">Edit</Button>
                  {#if business.status === 'LEAD'}
                    <form method="POST" action="?/publish" use:enhance>
                      <input type="hidden" name="id" value={business.id} />
                      <Button variant="primary" size="sm" type="submit">Publish</Button>
                    </form>
                    <form
                      method="POST"
                      action="?/decline"
                      use:enhance={({ cancel }) => {
                        if (!confirm(`Decline the request from ${business.name}?`)) cancel();
                      }}
                    >
                      <input type="hidden" name="id" value={business.id} />
                      <Button variant="ghost" size="sm" type="submit">Decline</Button>
                    </form>
                  {/if}
                </div>
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

  .filterBar.secondary {
    margin-top: calc(var(--space-4) * -1);
  }

  .form-error {
    background: color-mix(in srgb, var(--color-destructive) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--color-destructive) 30%, transparent);
    border-radius: var(--radius-md);
    color: var(--color-destructive);
    font-size: var(--text-sm);
    padding: var(--space-3) var(--space-4);
    margin: 0;
  }

  .leadMeta {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1) var(--space-3);
    margin-top: 2px;
    font-size: var(--text-xs);
    color: var(--color-text-muted);
  }

  .leadMsg {
    margin: var(--space-1) 0 0;
    font-size: var(--text-xs);
    font-style: italic;
    color: var(--color-text-muted);
    max-width: 42ch;
  }

  .rowActions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: var(--space-1);
  }

  .rowActions form {
    margin: 0;
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
