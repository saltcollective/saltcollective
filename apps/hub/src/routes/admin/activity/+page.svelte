<script lang="ts">
  import { EVENT_LABELS, fmtTime } from '$lib/audit-labels';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  const filters = $derived(data.filters);
  const totalPages = $derived(Math.max(1, Math.ceil(data.total / data.pageSize)));
  const rangeStart = $derived(data.total === 0 ? 0 : (data.page - 1) * data.pageSize + 1);
  const rangeEnd = $derived(Math.min(data.total, data.page * data.pageSize));

  // Rebuild the query string from current filters + overrides. Empty values are
  // dropped; `page` is intentionally reset unless explicitly overridden.
  function query(overrides: Record<string, string | number> = {}) {
    const merged: Record<string, string> = {
      entity: filters.entity,
      type: filters.type,
      q: filters.q,
      id: filters.id,
      from: filters.from,
      to: filters.to,
      ...Object.fromEntries(Object.entries(overrides).map(([k, v]) => [k, String(v)])),
    };
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) {
      if (v) params.set(k, v);
    }
    const s = params.toString();
    return s ? `/admin/activity?${s}` : '/admin/activity';
  }
</script>

<div class="adm-screen">
  <div class="adm-topbar">
    <div class="adm-topbar-main">
      <h1 class="adm-page-title">Activity</h1>
      <p class="adm-page-sub">Lifecycle events across the platform.</p>
    </div>
  </div>

  <form class="adm-toolbar" method="GET" action="/admin/activity">
    {#if filters.entity}<input type="hidden" name="entity" value={filters.entity} />{/if}
    {#if filters.id}<input type="hidden" name="id" value={filters.id} />{/if}
    <label class="adm-search">
      <span class="adm-search-icon">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
      </span>
      <input type="text" name="q" placeholder="Search entity or actor…" value={filters.q} />
    </label>
    <div class="adm-toolbar-filters">
      <a class="adm-pill" class:is-active={!filters.entity} href={query({ entity: '' })}>All</a>
      <a class="adm-pill" class:is-active={filters.entity === 'CLUB'} href={query({ entity: 'CLUB' })}>Clubs</a>
      <a class="adm-pill" class:is-active={filters.entity === 'USER'} href={query({ entity: 'USER' })}>Users</a>
      <select
        class="type-select"
        name="type"
        aria-label="Event type"
        onchange={(e) => e.currentTarget.form?.requestSubmit()}
      >
        <option value="" selected={!filters.type}>All events</option>
        {#each Object.entries(EVENT_LABELS) as [value, label]}
          <option {value} selected={filters.type === value}>{label}</option>
        {/each}
      </select>
      <input
        class="date-input"
        type="date"
        name="from"
        aria-label="From date"
        value={filters.from}
        onchange={(e) => e.currentTarget.form?.requestSubmit()}
      />
      <input
        class="date-input"
        type="date"
        name="to"
        aria-label="To date"
        value={filters.to}
        onchange={(e) => e.currentTarget.form?.requestSubmit()}
      />
    </div>
  </form>

  {#if filters.id}
    <div class="entity-chip">
      Showing one entity's history
      <a href={query({ id: '' })} aria-label="Clear entity filter">✕</a>
    </div>
  {/if}

  <section class="adm-card adm-card-flush adm-table-wrap">
    <table class="adm-table">
      <thead>
        <tr>
          <th>When</th>
          <th>Event</th>
          <th>Entity</th>
          <th>Detail</th>
          <th>Actor</th>
        </tr>
      </thead>
      <tbody>
        {#each data.events as event (event.id)}
          <tr>
            <td class="adm-cell-muted nowrap">{fmtTime(event.createdAt)}</td>
            <td class="adm-row-title">{EVENT_LABELS[event.type] ?? event.type}</td>
            <td>
              <span class="sc-badge sc-badge-default">{event.entityType === 'CLUB' ? 'Club' : 'User'}</span>
              <a class="adm-row-link entity-link" href={query({ entity: event.entityType, id: event.entityId })}>
                {event.entityName}
              </a>
            </td>
            <td class="adm-cell-muted">{event.detail ?? '—'}</td>
            <td class="adm-cell-muted">{event.actorEmail ?? 'system'}</td>
          </tr>
        {/each}
        {#if data.events.length === 0}
          <tr>
            <td colspan="5" class="empty">No events match these filters.</td>
          </tr>
        {/if}
      </tbody>
    </table>
  </section>

  <footer class="adm-tablefoot">
    <span>Showing {rangeStart}–{rangeEnd} of {data.total}</span>
    <div class="pager">
      {#if data.page > 1}
        <a class="sc-btn sc-btn-ghost sc-btn-sm" href={query({ page: data.page - 1 })}>← Prev</a>
      {/if}
      {#if data.page < totalPages}
        <a class="sc-btn sc-btn-ghost sc-btn-sm" href={query({ page: data.page + 1 })}>Next →</a>
      {/if}
    </div>
  </footer>
</div>

<style>
  .empty {
    padding: var(--space-8);
    text-align: center;
    color: var(--color-text-muted);
    font-size: var(--text-sm);
  }

  .nowrap {
    white-space: nowrap;
  }

  .type-select,
  .date-input {
    height: 34px;
    padding: 0 var(--space-2);
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    font-family: var(--font-sans);
    font-size: var(--text-sm);
    color: var(--color-text);
    outline: none;
    cursor: pointer;
    transition: border-color 0.15s;
  }

  .type-select:focus,
  .date-input:focus {
    border-color: var(--color-accent);
  }

  .entity-chip {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-1) var(--space-3);
    margin-bottom: var(--space-3);
    background: color-mix(in srgb, var(--color-accent) 14%, var(--color-surface-2));
    border-radius: var(--radius-full);
    font-size: var(--text-xs);
    color: var(--color-text);
  }

  .entity-chip a {
    color: var(--color-text-muted);
    text-decoration: none;
    font-weight: 700;
  }

  .entity-chip a:hover {
    color: var(--color-text);
  }

  .entity-link {
    margin-left: var(--space-2);
  }

  .pager {
    display: flex;
    gap: var(--space-2);
  }
</style>
