<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  let search = $state('');
  let activeFilter = $state<'all' | 'active' | 'inactive' | 'admin'>('all');

  function userStatus(user: (typeof data.users)[number]) {
    return user.isActive ? 'Active' : 'Inactive';
  }

  function userRole(user: (typeof data.users)[number]) {
    if (user.userType === 'SITE_ADMIN') return 'Site admin';
    if (user.memberships.some((m) => m.role === 'ADMIN')) return 'Club admin';
    if (user.memberships.some((m) => m.role === 'EDITOR')) return 'Editor';
    return 'Member';
  }

  const filtered = $derived(
    data.users
      .filter((u) => {
        if (activeFilter === 'active') return u.isActive;
        if (activeFilter === 'inactive') return !u.isActive;
        if (activeFilter === 'admin') return u.userType === 'SITE_ADMIN';
        return true;
      })
      .filter(
        (u) =>
          !search ||
          u.email.toLowerCase().includes(search.toLowerCase()) ||
          (u.username ?? '').toLowerCase().includes(search.toLowerCase()),
      ),
  );

  const counts = $derived({
    all: data.users.length,
    active: data.users.filter((u) => u.isActive).length,
    inactive: data.users.filter((u) => !u.isActive).length,
    admin: data.users.filter((u) => u.userType === 'SITE_ADMIN').length,
  });

  function initials(email: string, username: string | null) {
    const name = username ?? email.split('@')[0];
    return name.slice(0, 2).toUpperCase();
  }

  function fmt(date: Date | string) {
    return new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(date));
  }
</script>

<div class="adm-screen">
  <div class="adm-topbar">
    <div class="adm-topbar-main">
      <h1 class="adm-page-title">Users &amp; permissions</h1>
      <p class="adm-page-sub">All users registered on the platform.</p>
    </div>
  </div>

  <div class="adm-stats adm-stats-4">
    <div class="adm-stat">
      <div class="adm-stat-label">Total users</div>
      <div class="adm-stat-value">{counts.all}</div>
    </div>
    <div class="adm-stat">
      <div class="adm-stat-label">Active</div>
      <div class="adm-stat-value">{counts.active}</div>
    </div>
    <div class="adm-stat">
      <div class="adm-stat-label">Inactive</div>
      <div class="adm-stat-value">{counts.inactive}</div>
    </div>
    <div class="adm-stat">
      <div class="adm-stat-label">Site admins</div>
      <div class="adm-stat-value">{counts.admin}</div>
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
        placeholder="Search by email or username…"
        bind:value={search}
      />
    </label>
    <div class="adm-toolbar-filters">
      <button class="adm-pill" class:is-active={activeFilter === 'all'}      onclick={() => (activeFilter = 'all')}>All <span class="adm-pill-count">{counts.all}</span></button>
      <button class="adm-pill" class:is-active={activeFilter === 'active'}   onclick={() => (activeFilter = 'active')}>Active <span class="adm-pill-count">{counts.active}</span></button>
      <button class="adm-pill" class:is-active={activeFilter === 'inactive'} onclick={() => (activeFilter = 'inactive')}>Inactive <span class="adm-pill-count">{counts.inactive}</span></button>
      <button class="adm-pill" class:is-active={activeFilter === 'admin'}    onclick={() => (activeFilter = 'admin')}>Site admins <span class="adm-pill-count">{counts.admin}</span></button>
    </div>
  </div>

  <section class="adm-card adm-card-flush adm-table-wrap">
    <table class="adm-table">
      <thead>
        <tr>
          <th>User</th>
          <th>Role</th>
          <th>Clubs</th>
          <th>Status</th>
          <th>Joined</th>
        </tr>
      </thead>
      <tbody>
        {#each filtered as user (user.id)}
          {@const role = userRole(user)}
          <tr>
            <td>
              <div class="adm-row-main">
                <div class="adm-club-mark adm-club-mark-user">
                  {initials(user.email, user.username)}
                </div>
                <div>
                  <div class="adm-row-title">{user.username ?? user.email.split('@')[0]}</div>
                  <div class="adm-row-sub">{user.email}</div>
                </div>
              </div>
            </td>
            <td>
              <span class="adm-role {role === 'Site admin' ? 'adm-role-site-admin' : ''}">
                {role}
              </span>
            </td>
            <td class="adm-cell-muted">
              {#if user.memberships.length === 0}
                —
              {:else}
                {#each user.memberships as m, i}{#if i > 0}{', '}{/if}<a
                    class="adm-row-link"
                    href="/{m.club.slug}"
                    target="_blank"
                    rel="noopener">{m.club.name}</a
                  >{/each}
              {/if}
            </td>
            <td>
              <span class="sc-badge {user.isActive ? 'sc-badge-success' : 'sc-badge-default'}">
                {userStatus(user)}
              </span>
            </td>
            <td class="adm-cell-muted">{fmt(user.createdAt)}</td>
          </tr>
        {/each}
        {#if filtered.length === 0}
          <tr>
            <td colspan="5" class="empty">No users match your search.</td>
          </tr>
        {/if}
      </tbody>
    </table>
  </section>

  <footer class="adm-tablefoot">
    <span>Showing {filtered.length} of {data.users.length}</span>
  </footer>
</div>

<style>
  .empty {
    padding: var(--space-8);
    text-align: center;
    color: var(--color-text-muted);
    font-size: var(--text-sm);
  }
</style>
