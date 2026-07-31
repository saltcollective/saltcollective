<script lang="ts">
  import { enhance } from '$app/forms';
  import { siteDomain } from '$lib/domain';
  import { EVENT_LABELS, fmtTime } from '$lib/audit-labels';
  import type { PageData, ActionData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  const club = $derived(data.club);
  const activeSponsors = $derived(data.sponsors.filter((s) => s.status === 'ACTIVE').length);
  const leads = $derived(data.sponsors.filter((s) => s.status === 'LEAD').length);

  const SPONSOR_BADGES: Record<string, string> = {
    ACTIVE: 'sc-badge-success',
    LEAD: 'sc-badge-warning',
    DECLINED: 'sc-badge-destructive',
    ARCHIVED: 'sc-badge-default',
  };

  function fmt(date: Date | string | null) {
    if (!date) return '—';
    return new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(date));
  }

  function initials(name: string) {
    return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  }

  function memberName(member: PageData['members'][number]) {
    return member.user.username ?? member.user.email.split('@')[0];
  }
</script>

<div class="adm-screen">
  <div class="adm-topbar">
    <div class="adm-topbar-main">
      <a class="adm-link back-link" href="/admin/clubs">← Clubs</a>
      <div class="club-head">
        <div class="adm-club-mark club-mark-lg">{initials(club.name)}</div>
        <div>
          <h1 class="adm-page-title title-row">
            {club.name}
            {#if club.status !== 'ACTIVE'}
              <span class="sc-badge sc-badge-default">Suspended</span>
            {:else if !club.publishedAt}
              <span class="sc-badge sc-badge-warning">Not published</span>
            {:else}
              <span class="sc-badge sc-badge-success">Active</span>
            {/if}
          </h1>
          <p class="adm-page-sub">
            <a class="adm-row-link" href="/{club.slug}" target="_blank" rel="noopener">{siteDomain}/{club.slug}</a>
            {#if club.tagline}· {club.tagline}{/if}
          </p>
        </div>
      </div>
    </div>
    <div class="adm-topbar-actions">
      <form
        method="POST"
        action="?/impersonate"
        use:enhance={({ cancel }) => {
          if (
            !confirm(
              `Impersonate ${club.name}? You'll operate their dashboard with full admin access — changes affect the real club and are recorded in the audit log.`
            )
          ) {
            cancel();
            return;
          }
          return ({ update }) => update();
        }}
      >
        <button class="sc-btn sc-btn-secondary sc-btn-sm" type="submit">Impersonate</button>
      </form>
      <a class="sc-btn sc-btn-secondary sc-btn-sm" href="/{club.slug}" target="_blank" rel="noopener">
        View public hub
      </a>
      {#if !club.publishedAt}
        <form
          method="POST"
          action="?/publish"
          use:enhance={({ cancel }) => {
            if (!confirm(`Publish ${club.name}? Their hub at /${club.slug} will become publicly visible.`)) {
              cancel();
              return;
            }
            return ({ update }) => update();
          }}
        >
          <button class="sc-btn sc-btn-primary sc-btn-sm" type="submit">Publish</button>
        </form>
      {/if}
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
        <input type="hidden" name="status" value={club.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'} />
        <button class="sc-btn sc-btn-ghost sc-btn-sm" type="submit">
          {club.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
        </button>
      </form>
      <form
        method="POST"
        action="?/delete"
        use:enhance={({ cancel }) => {
          const typed = prompt(
            `This permanently deletes ${club.name} — all sponsors, tiers, members, invites and analytics.\n\nType the club slug "${club.slug}" to confirm:`
          );
          if (typed !== club.slug) {
            if (typed !== null) alert('Slug did not match — nothing was deleted.');
            cancel();
            return;
          }
          return ({ update }) => update();
        }}
      >
        <button class="sc-btn sc-btn-ghost sc-btn-sm danger" type="submit">Delete</button>
      </form>
    </div>
  </div>

  {#if form && 'error' in form && form.error}
    <p class="action-error">{form.error}</p>
  {/if}

  <div class="adm-stats adm-stats-4">
    <div class="adm-stat">
      <div class="adm-stat-label">Members</div>
      <div class="adm-stat-value">{data.members.length}</div>
    </div>
    <div class="adm-stat">
      <div class="adm-stat-label">Active sponsors</div>
      <div class="adm-stat-value">{activeSponsors}</div>
    </div>
    <div class="adm-stat">
      <div class="adm-stat-label">Leads</div>
      <div class="adm-stat-value">{leads}</div>
    </div>
    <div class="adm-stat">
      <div class="adm-stat-label">Clicks (30d)</div>
      <div class="adm-stat-value">{data.clicks30d}</div>
    </div>
  </div>

  <section class="adm-card lifecycle-card">
    <header class="adm-card-header">
      <h2 class="adm-card-title">Lifecycle</h2>
    </header>
    <div class="lifecycle-grid">
      <div><span class="lc-label">Created</span><span>{fmt(club.createdAt)}</span></div>
      <div><span class="lc-label">Published</span><span>{fmt(club.publishedAt)}</span></div>
      <div><span class="lc-label">Suspended</span><span>{fmt(club.suspendedAt)}</span></div>
      <div><span class="lc-label">Paid until</span><span>{fmt(club.paidUntil)}</span></div>
    </div>
  </section>

  <section class="adm-card adm-card-flush adm-table-wrap">
    <header class="adm-card-header adm-card-header-pad">
      <h2 class="adm-card-title">Members</h2>
    </header>
    <table class="adm-table">
      <thead>
        <tr>
          <th>Member</th>
          <th>Role</th>
          <th>Joined</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {#each data.members as member (member.id)}
          <tr>
            <td>
              <div class="adm-row-main">
                <div class="adm-club-mark adm-club-mark-user">
                  {(member.user.username ?? member.user.email).slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div class="adm-row-title">{memberName(member)}</div>
                  <div class="adm-row-sub">{member.user.email}</div>
                </div>
              </div>
            </td>
            <td><span class="sc-badge {member.role === 'ADMIN' ? 'sc-badge-success' : 'sc-badge-default'}">{member.role}</span></td>
            <td class="adm-cell-muted">{fmt(member.createdAt)}</td>
            <td class="adm-cell-action">
              <a class="sc-btn sc-btn-ghost sc-btn-sm" href="/admin/activity?entity=USER&id={member.user.id}">
                Activity
              </a>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </section>

  <section class="adm-card adm-card-flush adm-table-wrap">
    <header class="adm-card-header adm-card-header-pad">
      <h2 class="adm-card-title">Sponsors</h2>
    </header>
    <table class="adm-table">
      <thead>
        <tr>
          <th>Business</th>
          <th>Tier</th>
          <th>Status</th>
          <th>Added</th>
        </tr>
      </thead>
      <tbody>
        {#each data.sponsors as sponsor (sponsor.id)}
          <tr>
            <td class="adm-row-title">{sponsor.name}</td>
            <td class="adm-cell-muted">{sponsor.sponsorTier?.name ?? '—'}</td>
            <td>
              <span class="sc-badge {SPONSOR_BADGES[sponsor.status] ?? 'sc-badge-default'}">{sponsor.status}</span>
            </td>
            <td class="adm-cell-muted">{fmt(sponsor.createdAt)}</td>
          </tr>
        {/each}
        {#if data.sponsors.length === 0}
          <tr><td colspan="4" class="empty">No sponsors yet.</td></tr>
        {/if}
      </tbody>
    </table>
  </section>

  <section class="adm-card">
    <header class="adm-card-header">
      <h2 class="adm-card-title">Recent activity</h2>
      <a href="/admin/activity?entity=CLUB&id={club.id}" class="adm-link">View all →</a>
    </header>
    {#if data.recentEvents.length === 0}
      <p class="empty">No activity recorded yet.</p>
    {:else}
      <ul class="activity-list">
        {#each data.recentEvents as event (event.id)}
          <li class="activity-row">
            <div class="activity-main">
              <span class="activity-label">{EVENT_LABELS[event.type] ?? event.type}</span>
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
  .back-link {
    display: inline-block;
    margin-bottom: var(--space-2);
  }

  .club-head {
    display: flex;
    align-items: center;
    gap: var(--space-4);
  }

  .club-mark-lg {
    width: 48px;
    height: 48px;
    font-size: var(--text-base);
  }

  .title-row {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .lifecycle-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: var(--space-4);
  }

  .lifecycle-grid > div {
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-size: var(--text-sm);
    color: var(--color-text);
  }

  .lc-label {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .lifecycle-card {
    margin-bottom: var(--space-4);
  }

  .empty {
    padding: var(--space-8);
    text-align: center;
    color: var(--color-text-muted);
    font-size: var(--text-sm);
  }

  .danger {
    color: var(--color-destructive, #f87171);
  }

  .action-error {
    margin: 0 0 var(--space-3);
    font-size: var(--text-sm);
    color: var(--color-destructive, #f87171);
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
</style>
