<script lang="ts">
  import { enhance } from '$app/forms';
  import { siteDomain } from '$lib/domain';
  import type { PageData, ActionData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  let search = $state('');
  let activeFilter = $state<'all' | 'ACTIVE' | 'SUSPENDED'>('all');

  const filtered = $derived(
    data.clubs
      .filter((c) => activeFilter === 'all' || c.status === activeFilter)
      .filter(
        (c) =>
          !search ||
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.slug.toLowerCase().includes(search.toLowerCase()),
      ),
  );

  const counts = $derived({
    all: data.clubs.length,
    active: data.clubs.filter((c) => c.status === 'ACTIVE').length,
    suspended: data.clubs.filter((c) => c.status === 'SUSPENDED').length,
  });

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
      <h1 class="adm-page-title">Clubs</h1>
      <p class="adm-page-sub">
        Every club on Salt Collective.
        {counts.all} total — {counts.active} active.
      </p>
    </div>
  </div>

  <div class="adm-toolbar">
    <label class="adm-search">
      <span class="adm-search-icon">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
      </span>
      <input
        type="text"
        placeholder="Search clubs or slugs…"
        bind:value={search}
      />
    </label>
    <div class="adm-toolbar-filters">
      <button
        class="adm-pill"
        class:is-active={activeFilter === 'all'}
        onclick={() => (activeFilter = 'all')}
      >
        All <span class="adm-pill-count">{counts.all}</span>
      </button>
      <button
        class="adm-pill"
        class:is-active={activeFilter === 'ACTIVE'}
        onclick={() => (activeFilter = 'ACTIVE')}
      >
        Active <span class="adm-pill-count">{counts.active}</span>
      </button>
      <button
        class="adm-pill"
        class:is-active={activeFilter === 'SUSPENDED'}
        onclick={() => (activeFilter = 'SUSPENDED')}
      >
        Suspended <span class="adm-pill-count">{counts.suspended}</span>
      </button>
    </div>
  </div>

  <section class="adm-card adm-card-flush adm-table-wrap">
    <table class="adm-table">
      <thead>
        <tr>
          <th>Club</th>
          <th class="adm-num">Members</th>
          <th class="adm-num">Sponsors</th>
          <th>Status</th>
          <th>Joined</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {#each filtered as club (club.id)}
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
            <td class="adm-cell-action">
              <div class="row-actions">
                <a class="sc-btn sc-btn-ghost sc-btn-sm" href="/admin/activity?entity=CLUB&id={club.id}">
                  Activity
                </a>
                <form
                  method="POST"
                  action="?/setStatus"
                  use:enhance={({ cancel }) => {
                    if (
                      club.status === 'ACTIVE' &&
                      !confirm(`Suspend ${club.name}? Their public hub will be hidden until reactivated.`)
                    ) {
                      cancel();
                      return;
                    }
                    return ({ update }) => update();
                  }}
                >
                  <input type="hidden" name="clubId" value={club.id} />
                  <input type="hidden" name="status" value={club.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'} />
                  <button class="sc-btn sc-btn-ghost sc-btn-sm" type="submit">
                    {club.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                  </button>
                </form>
                <form
                  method="POST"
                  action="?/delete"
                  use:enhance={({ cancel }) => {
                    const expected = club.slug;
                    const typed = prompt(
                      `This permanently deletes ${club.name} — all sponsors, tiers, members, invites and analytics.\n\nType the club slug "${expected}" to confirm:`
                    );
                    if (typed !== expected) {
                      if (typed !== null) alert('Slug did not match — nothing was deleted.');
                      cancel();
                      return;
                    }
                    return ({ update }) => update();
                  }}
                >
                  <input type="hidden" name="clubId" value={club.id} />
                  <button class="sc-btn sc-btn-ghost sc-btn-sm danger" type="submit">Delete</button>
                </form>
              </div>
            </td>
          </tr>
        {/each}
        {#if filtered.length === 0}
          <tr>
            <td colspan="6" class="empty">No clubs match your search.</td>
          </tr>
        {/if}
      </tbody>
    </table>
  </section>

  {#if form && 'error' in form && form.error}
    <p class="action-error">{form.error}</p>
  {/if}

  <footer class="adm-tablefoot">
    <span>Showing {filtered.length} of {data.clubs.length}</span>
  </footer>
</div>

<style>
  .empty {
    padding: var(--space-8);
    text-align: center;
    color: var(--color-text-muted);
    font-size: var(--text-sm);
  }

  .row-actions {
    display: flex;
    gap: var(--space-2);
    justify-content: flex-end;
  }

  .row-actions .danger {
    color: var(--color-destructive, #f87171);
  }

  .action-error {
    margin: var(--space-3) 0 0;
    font-size: var(--text-sm);
    color: var(--color-destructive, #f87171);
  }
</style>
