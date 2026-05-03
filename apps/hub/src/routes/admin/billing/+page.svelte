<script lang="ts">
  import type { PageData } from './$types';
  let { data }: { data: PageData } = $props();

  // Stub data — replace once Stripe is connected
  const mrrTrend = [380, 395, 410, 420, 435, 449, 456, 449, 461, 470, 480, 490];
  const maxMrr = Math.max(...mrrTrend);

  const invoices = [
    { id: 'INV-3012', club: 'Riverside FC',          plan: 'Hub Annual',  date: '1 May 2026',  amount: 49, status: 'Paid' },
    { id: 'INV-3011', club: 'Northside Netball',      plan: 'Hub Annual',  date: '1 May 2026',  amount: 49, status: 'Paid' },
    { id: 'INV-3010', club: 'Surry Park CC',          plan: 'Hub Monthly', date: '28 Apr 2026', amount: 5,  status: 'Failed' },
    { id: 'INV-3009', club: 'Fremantle Hockey Club',  plan: 'Hub Annual',  date: '25 Apr 2026', amount: 49, status: 'Paid' },
    { id: 'INV-3008', club: 'East Hills FC',          plan: 'Hub Annual',  date: '20 Apr 2026', amount: 49, status: 'Refunded' },
  ];

  let invoiceFilter = $state<'all' | 'Paid' | 'Failed' | 'Refunded'>('all');

  const filteredInvoices = $derived(
    invoices.filter((i) => invoiceFilter === 'all' || i.status === invoiceFilter),
  );

  function badgeVariant(status: string) {
    if (status === 'Paid') return 'sc-badge-success';
    if (status === 'Failed') return 'sc-badge-destructive';
    if (status === 'Refunded') return 'sc-badge-warning';
    return 'sc-badge-default';
  }

  function initials(name: string) {
    return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  }
</script>

<div class="adm-screen">
  <div class="adm-topbar">
    <div class="adm-topbar-main">
      <h1 class="adm-page-title">Billing</h1>
      <p class="adm-page-sub">Subscriptions, invoices and payouts across all clubs.</p>
    </div>
    <div class="adm-topbar-actions">
      <button class="sc-btn sc-btn-secondary sc-btn-sm" disabled>Stripe dashboard ↗</button>
    </div>
  </div>

  {#if !data.stripeConnected}
    <div class="stripe-notice">
      <div class="stripe-notice-title">Stripe not connected</div>
      <p class="stripe-notice-sub">
        Connect Stripe to see live MRR, subscription status, and invoice data.
        The figures below are illustrative placeholders.
      </p>
    </div>
  {/if}

  <div class="adm-stats adm-stats-4">
    <div class="adm-stat">
      <div class="adm-stat-label">MRR</div>
      <div class="adm-stat-value">$490</div>
      <div class="adm-stat-foot adm-trend-up">+5.4% wk</div>
    </div>
    <div class="adm-stat">
      <div class="adm-stat-label">ARR (projected)</div>
      <div class="adm-stat-value">$5,880</div>
      <div class="adm-stat-foot">12 active subs</div>
    </div>
    <div class="adm-stat">
      <div class="adm-stat-label">Outstanding</div>
      <div class="adm-stat-value adm-trend-down">$5</div>
      <div class="adm-stat-foot">1 invoice past due</div>
    </div>
    <div class="adm-stat">
      <div class="adm-stat-label">Refunded (30d)</div>
      <div class="adm-stat-value">$49</div>
      <div class="adm-stat-foot">1 refund</div>
    </div>
  </div>

  <div class="adm-grid adm-grid-2-3">
    <section class="adm-card">
      <header class="adm-card-header">
        <div>
          <h2 class="adm-card-title">MRR trend</h2>
          <p class="adm-card-sub">Last 12 weeks · AUD</p>
        </div>
        <div class="adm-segmented">
          <button class="adm-seg-btn">3m</button>
          <button class="adm-seg-btn is-active">12w</button>
          <button class="adm-seg-btn">YTD</button>
        </div>
      </header>
      <div class="adm-bars-vert">
        {#each mrrTrend as v}
          <div class="adm-bar-col">
            <div class="adm-bar-col-fill" style="height: {(v / maxMrr) * 100}%"></div>
          </div>
        {/each}
      </div>
      <div class="adm-bars-axis">
        {#each mrrTrend as _, i}
          <span>W{i + 1}</span>
        {/each}
      </div>
    </section>

    <section class="adm-card">
      <header class="adm-card-header">
        <h2 class="adm-card-title">Plan mix</h2>
        <span class="adm-card-meta">12 paying</span>
      </header>
      <ul class="adm-bars">
        <li class="adm-bar-row">
          <div class="adm-bar-label">
            <span class="adm-bar-name">Hub Annual</span>
            <span class="adm-bar-meta">$49/mo equiv · 9 clubs</span>
          </div>
          <div class="adm-bar-track"><div class="adm-bar-fill" style="width: 75%"></div></div>
          <div class="adm-bar-value">$441</div>
        </li>
        <li class="adm-bar-row">
          <div class="adm-bar-label">
            <span class="adm-bar-name">Hub Monthly</span>
            <span class="adm-bar-meta">$5/mo · 3 clubs</span>
          </div>
          <div class="adm-bar-track"><div class="adm-bar-fill" style="width: 25%"></div></div>
          <div class="adm-bar-value">$15</div>
        </li>
        <li class="adm-bar-row">
          <div class="adm-bar-label">
            <span class="adm-bar-name">Trial</span>
            <span class="adm-bar-meta">14 days · 2 clubs</span>
          </div>
          <div class="adm-bar-track"><div class="adm-bar-fill" style="width: 12%"></div></div>
          <div class="adm-bar-value">$0</div>
        </li>
      </ul>
      <div class="adm-divider"></div>
      <div class="adm-mini-row">
        <div><div class="adm-mini-label">ARPU</div><div class="adm-mini-value">$41</div></div>
        <div><div class="adm-mini-label">Churn (90d)</div><div class="adm-mini-value">3.1%</div></div>
        <div><div class="adm-mini-label">LTV</div><div class="adm-mini-value">$1,320</div></div>
      </div>
    </section>
  </div>

  <section class="adm-card adm-card-flush adm-table-wrap">
    <header class="adm-card-header adm-card-header-pad">
      <h2 class="adm-card-title">Recent invoices</h2>
      <div class="adm-card-tools">
        <button class="adm-pill" class:is-active={invoiceFilter === 'all'}       onclick={() => (invoiceFilter = 'all')}>All</button>
        <button class="adm-pill" class:is-active={invoiceFilter === 'Paid'}      onclick={() => (invoiceFilter = 'Paid')}>Paid</button>
        <button class="adm-pill" class:is-active={invoiceFilter === 'Failed'}    onclick={() => (invoiceFilter = 'Failed')}>Failed</button>
        <button class="adm-pill" class:is-active={invoiceFilter === 'Refunded'}  onclick={() => (invoiceFilter = 'Refunded')}>Refunded</button>
      </div>
    </header>
    <table class="adm-table">
      <thead>
        <tr>
          <th>Invoice</th>
          <th>Club</th>
          <th>Plan</th>
          <th>Date</th>
          <th class="adm-num">Amount</th>
          <th>Status</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {#each filteredInvoices as inv}
          <tr>
            <td><span class="adm-mono">{inv.id}</span></td>
            <td>
              <div class="adm-row-main">
                <div class="adm-club-mark adm-club-mark-sm">{initials(inv.club)}</div>
                <span class="adm-row-title">{inv.club}</span>
              </div>
            </td>
            <td class="adm-cell-muted">{inv.plan}</td>
            <td class="adm-cell-muted">{inv.date}</td>
            <td class="adm-num">${inv.amount}</td>
            <td><span class="sc-badge {badgeVariant(inv.status)}">{inv.status}</span></td>
            <td class="adm-cell-action">
              <button class="sc-btn sc-btn-ghost sc-btn-sm" disabled>View</button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </section>
</div>

<style>
  .stripe-notice {
    background: color-mix(in srgb, var(--color-warning) 8%, transparent);
    border: 1px solid color-mix(in srgb, var(--color-warning) 25%, transparent);
    border-radius: var(--radius-md);
    padding: var(--space-4) var(--space-5);
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .stripe-notice-title {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--color-warning);
  }

  .stripe-notice-sub {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    margin: 0;
    line-height: var(--leading-normal);
  }
</style>
