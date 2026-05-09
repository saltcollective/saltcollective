<script lang="ts">
  import PageHeader from '$lib/components/PageHeader.svelte';
  import { Stat } from '@saltcollective/ui';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  const periodLabel = $derived(
    data.period === '30d' ? 'Last 30 days' :
    data.period === '90d' ? 'Last 90 days' : 'All time'
  );

  const CHART_W = 600;
  const CHART_H = 120;
  const BAR_GAP = 2;

  function shouldShowLabel(i: number, n: number, step: number) {
    return i === 0 || i === n - 1 || i % step === 0;
  }

  function formatLabel(date: string, period: string) {
    if (period === 'all') {
      return new Date(date + '-01T00:00:00').toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    }
    return new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  const chartBars = $derived.by(() => {
    const pts = data.chart;
    if (!pts.length) return [];
    const maxVal = Math.max(...pts.map(p => p.total), 1);
    const n = pts.length;
    const barW = (CHART_W - BAR_GAP * (n - 1)) / n;
    const step = Math.max(1, Math.round(n / 6));
    return pts.map((p, i) => ({
      x: i * (barW + BAR_GAP),
      y: CHART_H - (p.total / maxVal) * CHART_H,
      w: barW,
      h: (p.total / maxVal) * CHART_H,
      date: p.date,
      total: p.total,
      label: shouldShowLabel(i, n, step) ? formatLabel(p.date, data.period) : null,
    }));
  });
</script>

<div class="screen">
  <PageHeader title="Analytics" subtitle="Click engagement across your sponsors." />

  <div class="toolbar">
    <div class="chips">
      <a href="?period=all" class="chip" class:active={data.period === 'all'}>All time</a>
      <a href="?period=30d" class="chip" class:active={data.period === '30d'}>Last 30 days</a>
      <a href="?period=90d" class="chip" class:active={data.period === '90d'}>Last 90 days</a>
    </div>
    <p class="summary">
      {data.totalClicks} total click{data.totalClicks === 1 ? '' : 's'} · {periodLabel}
    </p>
  </div>

  <div class="stats">
    <Stat label="Total clicks"   value={data.totalClicks} />
    <Stat label="Website clicks" value={data.totalWebsite} />
    <Stat label="Email clicks"   value={data.totalEmail} />
    <Stat label="Phone clicks"   value={data.totalPhone} />
  </div>

  <section class="chartCard">
    <h2 class="chartTitle">Clicks over time</h2>
    {#if chartBars.every(b => b.total === 0)}
      <p class="chartEmpty">No clicks recorded for this period.</p>
    {:else}
      <div class="chartWrap">
        <svg
          viewBox="0 0 {CHART_W} {CHART_H + 24}"
          preserveAspectRatio="none"
          class="chartSvg"
          role="img"
          aria-label="Clicks over time bar chart"
        >
          {#each [0.25, 0.5, 0.75, 1] as frac}
            <line
              x1="0" x2={CHART_W}
              y1={CHART_H - frac * CHART_H}
              y2={CHART_H - frac * CHART_H}
              stroke="var(--color-border)"
              stroke-width="1"
              stroke-dasharray="2 4"
            />
          {/each}
          {#each chartBars as bar}
            <rect
              x={bar.x} y={bar.y}
              width={bar.w} height={bar.h}
              rx="2"
              fill="var(--color-accent)"
              opacity="0.8"
            >
              <title>{bar.date}: {bar.total} click{bar.total === 1 ? '' : 's'}</title>
            </rect>
          {/each}
          {#each chartBars as bar}
            {#if bar.label}
              <text
                x={bar.x + bar.w / 2}
                y={CHART_H + 18}
                text-anchor="middle"
                font-size="9"
                fill="var(--color-text-muted)"
              >{bar.label}</text>
            {/if}
          {/each}
        </svg>
      </div>
    {/if}
  </section>

  <section class="card">
    {#if data.rows.length === 0}
      <p class="empty">No sponsors yet.</p>
    {:else}
      <table class="table">
        <thead>
          <tr>
            <th>Sponsor</th>
            <th>Tier</th>
            <th class="num">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              Website
            </th>
            <th class="num">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              Email
            </th>
            <th class="num">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.79a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              Phone
            </th>
            <th class="num total">Total</th>
          </tr>
        </thead>
        <tbody>
          {#each data.rows as row}
            <tr>
              <td>
                <div class="rowMain">
                  {#if row.logoUrl}
                    <img src={row.logoUrl} alt="" class="avatar avatar-img" />
                  {:else}
                    <div class="avatar">{row.name[0].toUpperCase()}</div>
                  {/if}
                  <span class="rowTitle">{row.name}</span>
                </div>
              </td>
              <td class="muted">{row.sponsorTier.name}</td>
              <td class="num">{row.clicks.WEBSITE || '—'}</td>
              <td class="num">{row.clicks.EMAIL || '—'}</td>
              <td class="num">{row.clicks.PHONE || '—'}</td>
              <td class="num total">{row.clicks.total || '—'}</td>
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

  /* ---- Toolbar ---- */
  .toolbar {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    flex-wrap: wrap;
  }

  .chips {
    display: flex;
    gap: var(--space-2);
  }

  .chip {
    display: inline-block;
    padding: var(--space-2) var(--space-4);
    border-radius: var(--radius-full);
    border: 1px solid var(--color-border);
    color: var(--color-text-muted);
    font-size: var(--text-sm);
    font-weight: 500;
    text-decoration: none;
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

  .summary {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    margin: 0;
  }

  /* ---- Stats row ---- */
  .stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--space-4);
  }

  /* ---- Chart card ---- */
  .chartCard {
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-5) var(--space-6) var(--space-4);
  }

  .chartTitle {
    font-size: var(--text-base);
    font-weight: 700;
    color: var(--color-text);
    letter-spacing: -0.01em;
    margin: 0 0 var(--space-4);
  }

  .chartSvg {
    display: block;
    width: 100%;
    min-height: 80px;
  }

  .chartEmpty {
    padding: var(--space-6) 0;
    text-align: center;
    color: var(--color-text-muted);
    font-size: var(--text-sm);
    margin: 0;
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
    letter-spacing: 0.08em;
    border-bottom: 1px solid var(--color-border);
    white-space: nowrap;
  }

  .table th svg {
    vertical-align: -1px;
    margin-right: var(--space-1);
    opacity: 0.7;
  }

  .table td {
    padding: var(--space-3) var(--space-5);
    border-bottom: 1px solid var(--color-border);
    vertical-align: middle;
  }

  .table tr:last-child td {
    border-bottom: none;
  }

  .num {
    text-align: right;
    font-variant-numeric: tabular-nums;
    color: var(--color-text-muted);
  }

  .total {
    font-weight: 700;
    color: var(--color-text);
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

  .avatar-img {
    object-fit: contain;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
  }

  .rowTitle {
    font-weight: 600;
    color: var(--color-text);
  }

  .muted {
    color: var(--color-text-muted);
  }

  .empty {
    padding: var(--space-8);
    text-align: center;
    color: var(--color-text-muted);
    font-size: var(--text-sm);
    margin: 0;
  }

  /* ---- Responsive ---- */
  @media (max-width: 820px) {
    .screen {
      padding: var(--space-6) var(--space-4);
      gap: var(--space-5);
    }

    .toolbar {
      gap: var(--space-3);
    }

    .chips {
      flex-wrap: nowrap;
      overflow-x: auto;
      margin: 0 calc(var(--space-4) * -1);
      padding: 0 var(--space-4);
      scrollbar-width: none;
    }

    .chips::-webkit-scrollbar { display: none; }

    .chip { flex: 0 0 auto; }

    .stats {
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-3);
    }

    .chartCard {
      padding: var(--space-4);
    }

    /* Reflow table to card rows */
    .table thead { display: none; }

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
        'name  total'
        'tier  counts';
      column-gap: var(--space-3);
      row-gap: var(--space-2);
      align-items: center;
    }

    .table tr:last-child { border-bottom: none; }

    .table td {
      padding: 0;
      border-bottom: none;
      text-align: left;
    }

    /* name | tier | website | email | phone | total */
    .table td:nth-child(1) { grid-area: name; }
    .table td:nth-child(2) { grid-area: tier; font-size: var(--text-xs); color: var(--color-text-muted); }
    /* website/email/phone collapse into a single counts cell */
    .table td:nth-child(3) { display: none; }
    .table td:nth-child(4) { display: none; }
    .table td:nth-child(5) { display: none; }
    .table td:nth-child(6) {
      grid-area: total;
      font-weight: 700;
      font-size: var(--text-base);
      color: var(--color-text);
      text-align: right;
    }
  }
</style>
