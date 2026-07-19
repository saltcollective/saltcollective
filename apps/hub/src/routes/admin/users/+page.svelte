<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData, ActionData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  let search = $state('');
  let activeFilter = $state<'all' | 'active' | 'inactive' | 'admin'>('all');

  function userStatus(user: (typeof data.users)[number]) {
    return user.isActive ? 'Active' : 'Inactive';
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
          <th>Last active</th>
          <th>Joined</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {#each filtered as user (user.id)}
          {@const isSelf = user.id === data.currentUserId}
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
              {#if isSelf}
                <span class="adm-role adm-role-site-admin">Site admin</span>
              {:else}
                <form method="POST" action="?/setUserType" use:enhance>
                  <input type="hidden" name="userId" value={user.id} />
                  <select
                    class="type-select"
                    name="userType"
                    aria-label="Platform role for {user.email}"
                    onchange={(e) => e.currentTarget.form?.requestSubmit()}
                  >
                    <option value="MEMBER" selected={user.userType === 'MEMBER'}>Member</option>
                    <option value="SITE_ADMIN" selected={user.userType === 'SITE_ADMIN'}>Site admin</option>
                  </select>
                </form>
              {/if}
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
            <td class="adm-cell-muted">{user.lastActiveAt ? fmt(user.lastActiveAt) : '—'}</td>
            <td class="adm-cell-muted">{fmt(user.createdAt)}</td>
            <td class="adm-cell-action">
              <div class="row-actions">
                <a class="sc-btn sc-btn-ghost sc-btn-sm" href="/admin/activity?entity=USER&id={user.id}">
                  Activity
                </a>
                {#if !isSelf}
                  <form
                    method="POST"
                    action="?/setActive"
                    use:enhance={({ cancel }) => {
                      if (
                        user.isActive &&
                        !confirm(
                          `Deactivate ${user.email}? They'll be blocked from signing in until reactivated.`
                        )
                      ) {
                        cancel();
                        return;
                      }
                      return ({ update }) => update();
                    }}
                  >
                    <input type="hidden" name="userId" value={user.id} />
                    <input type="hidden" name="active" value={user.isActive ? 'false' : 'true'} />
                    <button class="sc-btn sc-btn-ghost sc-btn-sm" type="submit">
                      {user.isActive ? 'Deactivate' : 'Reactivate'}
                    </button>
                  </form>
                  <form
                    method="POST"
                    action="?/delete"
                    use:enhance={({ cancel }) => {
                      const typed = prompt(
                        `This permanently deletes ${user.email} — their sign-in and club memberships. Club content stays.\n\nType their email to confirm:`
                      );
                      if (typed !== user.email) {
                        if (typed !== null) alert('Email did not match — nothing was deleted.');
                        cancel();
                        return;
                      }
                      return ({ update }) => update();
                    }}
                  >
                    <input type="hidden" name="userId" value={user.id} />
                    <button class="sc-btn sc-btn-ghost sc-btn-sm danger" type="submit">Delete</button>
                  </form>
                {/if}
              </div>
            </td>
          </tr>
        {/each}
        {#if filtered.length === 0}
          <tr>
            <td colspan="7" class="empty">No users match your search.</td>
          </tr>
        {/if}
      </tbody>
    </table>
  </section>

  {#if form && 'error' in form && form.error}
    <p class="action-error">{form.error}</p>
  {/if}

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

  .type-select {
    height: 32px;
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

  .type-select:focus {
    border-color: var(--color-accent);
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
