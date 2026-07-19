<script lang="ts">
  import { siteDomain } from '$lib/domain';
  import { EVENT_LABELS, fmtTime } from '$lib/audit-labels';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  const stats = $derived(data.stats);
  const recentClubs = $derived(data.recentClubs);
  const recentActivity = $derived(data.recentActivity);

  function fmt(date: Date | string) {
    return new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(date));
  }

  function initials(name: string) {
    return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  }
</script>

<div class="adm-screen">
  <div class="adm-topbar">
    <div class="adm-topbar-main">
      <p class="adm-eyebrow">Salt Collective platform</p>
      <h1 class="adm-page-title">Dashboard</h1>
      <p class="adm-page-sub">Platform health at a glance.</p>
    </div>
  </div>

  <div class="adm-stats adm-stats-4">
    <div class="adm-stat">
      <div class="adm-stat-label">Active clubs</div>
      <div class="adm-stat-value">
        {stats.activeClubs}<span class="adm-stat-unit"> / {stats.totalClubs}</span>
      </div>
    </div>
    <div class="adm-stat">
      <div class="adm-stat-label">Total clubs</div>
      <div class="adm-stat-value">{stats.totalClubs}</div>
    </div>
    <div class="adm-stat">
      <div class="adm-stat-label">Total sponsors</div>
      <div class="adm-stat-value">{stats.totalSponsors}</div>
    </div>
    <div class="adm-stat">
      <div class="adm-stat-label">Total users</div>
      <div class="adm-stat-value">{stats.totalUsers}</div>
    </div>
  </div>

  <div class="adm-grid adm-grid-2-3">
    <section class="adm-card adm-card-flush">
      <header class="adm-card-header adm-card-header-pad">
        <h2 class="adm-card-title">Recent clubs</h2>
        <a href="/admin/clubs" class="adm-link">View all →</a>
      </header>
      {#if recentClubs.length === 0}
        <p class="empty">No clubs yet.</p>
      {:else}
        <table class="adm-table">
          <thead>
            <tr>
              <th>Club</th>
              <th class="adm-num">Members</th>
              <th class="adm-num">Sponsors</th>
              <th>Status</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {#each recentClubs as club}
              <tr>
                <td>
                  <div class="adm-row-main">
                    <div class="adm-club-mark">{initials(club.name)}</div>
                    <div>
                      <div class="adm-row-title">{club.name}</div>
                      <div class="adm-row-sub">
                        <a class="adm-row-link" href="/{club.slug}" target="_blank" rel="noopener">{siteDomain}/{club.slug}</a>
                      </div>
                    </div>
                  </div>
                </td>
                <td class="adm-num">{club._count.memberships}</td>
                <td class="adm-num">{club._count.businesses}</td>
                <td>
                  <span class="sc-badge {club.status === 'ACTIVE' ? 'sc-badge-success' : 'sc-badge-default'}">
                    {club.status === 'ACTIVE' ? 'Active' : 'Suspended'}
                  </span>
                </td>
                <td class="adm-cell-muted">{fmt(club.createdAt)}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
    </section>

    <section class="adm-card">
      <header class="adm-card-header">
        <h2 class="adm-card-title">Platform overview</h2>
      </header>

      <div class="overview-grid">
        <div class="overview-item">
          <div class="overview-label">Clubs active</div>
          <div class="overview-value">{stats.activeClubs}</div>
        </div>
        <div class="overview-item">
          <div class="overview-label">Clubs total</div>
          <div class="overview-value">{stats.totalClubs}</div>
        </div>
        <div class="overview-item">
          <div class="overview-label">Sponsors</div>
          <div class="overview-value">{stats.totalSponsors}</div>
        </div>
        <div class="overview-item">
          <div class="overview-label">Users</div>
          <div class="overview-value">{stats.totalUsers}</div>
        </div>
      </div>

      <div class="adm-divider"></div>

      <div class="billing-notice">
        <div class="billing-notice-title">Billing not yet connected</div>
        <p class="billing-notice-sub">
          MRR and subscription data will appear here once Stripe is integrated.
        </p>
        <a href="/admin/billing" class="adm-link">View billing →</a>
      </div>
    </section>
  </div>

  <section class="adm-card">
    <header class="adm-card-header">
      <h2 class="adm-card-title">Recent activity</h2>
      <a href="/admin/activity" class="adm-link">View all →</a>
    </header>
    {#if recentActivity.length === 0}
      <p class="empty">No activity recorded yet.</p>
    {:else}
      <ul class="activity-list">
        {#each recentActivity as event (event.id)}
          <li class="activity-row">
            <div class="activity-main">
              <span class="activity-label">{EVENT_LABELS[event.type] ?? event.type}</span>
              <span class="activity-entity">{event.entityName}</span>
              {#if event.detail}
                <span class="activity-detail">{event.detail}</span>
              {/if}
            </div>
            <div class="activity-meta">
              {#if event.actorEmail}<span>{event.actorEmail}</span>{/if}
              <span>{fmtTime(event.createdAt)}</span>
            </div>
          </li>
        {/each}
      </ul>
    {/if}
  </section>
</div>

<style>
  .empty {
    padding: var(--space-8);
    text-align: center;
    color: var(--color-text-muted);
    font-size: var(--text-sm);
  }

  .activity-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .activity-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: var(--space-4);
    padding: var(--space-3) 0;
    border-bottom: 1px solid var(--color-border);
    font-size: var(--text-sm);
  }

  .activity-row:last-child {
    border-bottom: none;
  }

  .activity-main {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    align-items: baseline;
    min-width: 0;
  }

  .activity-label {
    font-weight: 600;
    color: var(--color-text);
  }

  .activity-entity {
    color: var(--color-accent);
  }

  .activity-detail {
    color: var(--color-text-muted);
    font-size: var(--text-xs);
  }

  .activity-meta {
    display: flex;
    gap: var(--space-3);
    color: var(--color-text-muted);
    font-size: var(--text-xs);
    flex-shrink: 0;
  }

  .overview-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-3);
  }

  .overview-item {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-4);
  }

  .overview-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--color-text-muted);
    margin-bottom: var(--space-2);
  }

  .overview-value {
    font-size: var(--text-2xl);
    font-weight: 800;
    color: var(--color-text);
    letter-spacing: -0.02em;
  }

  .billing-notice {
    background: color-mix(in srgb, var(--color-warning) 8%, transparent);
    border: 1px solid color-mix(in srgb, var(--color-warning) 25%, transparent);
    border-radius: var(--radius-md);
    padding: var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .billing-notice-title {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--color-warning);
  }

  .billing-notice-sub {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    margin: 0;
    line-height: var(--leading-normal);
  }
</style>
