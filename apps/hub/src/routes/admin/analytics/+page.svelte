<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  const stats = $derived(data.stats);
  const topClubs = $derived(data.topClubs);
  const weeklyClicks = $derived(data.weeklyClicks);
  const heatmap = $derived(data.heatmap);
  const maxClicks = $derived(topClubs.length > 0 ? topClubs[0].clicks : 1);

  // SVG area chart for weekly clicks
  const W = 720, H = 180;
  const chartData = $derived.by(() => {
    const min = Math.min(...weeklyClicks);
    const max = Math.max(...weeklyClicks) || 1;
    const pts = weeklyClicks.map((v, i) => {
      const x = (i / (weeklyClicks.length - 1)) * W;
      const y = H - ((v - min) / (max - min || 1)) * (H - 16) - 8;
      return [x, y] as [number, number];
    });
    const linePath = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
    const fillPath = linePath + ` L ${W} ${H} L 0 ${H} Z`;
    return { pts, linePath, fillPath };
  });

  const heatmaxVal = $derived(Math.max(...heatmap.flat(), 1));
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
</script>

<div class="adm-screen">
  <div class="adm-topbar">
    <div class="adm-topbar-main">
      <h1 class="adm-page-title">Analytics</h1>
      <p class="adm-page-sub">Platform engagement across every club.</p>
    </div>
    <div class="adm-topbar-actions">
      <a class="sc-btn sc-btn-secondary sc-btn-sm" href="/admin/analytics/export" data-sveltekit-reload>Export</a>
    </div>
  </div>

  <div class="adm-stats adm-stats-4">
    <div class="adm-stat">
      <div class="adm-stat-label">Active clubs</div>
      <div class="adm-stat-value">{stats.activeClubs}<span class="adm-stat-unit"> / {stats.totalClubs}</span></div>
    </div>
    <div class="adm-stat">
      <div class="adm-stat-label">Total clubs</div>
      <div class="adm-stat-value">{stats.totalClubs}</div>
    </div>
    <div class="adm-stat">
      <div class="adm-stat-label">Sponsors</div>
      <div class="adm-stat-value">{stats.totalSponsors}</div>
    </div>
    <div class="adm-stat">
      <div class="adm-stat-label">Hub clicks (30d)</div>
      <div class="adm-stat-value">{stats.clicks30d.toLocaleString()}</div>
    </div>
  </div>

  <section class="adm-card">
    <header class="adm-card-header">
      <div>
        <h2 class="adm-card-title">Hub clicks · last 12 weeks</h2>
        <p class="adm-card-sub">
          {weeklyClicks[0]} → {weeklyClicks[weeklyClicks.length - 1]} clicks/week
        </p>
      </div>
    </header>
    <div class="adm-chart">
      <svg viewBox="0 0 {W} {H}" preserveAspectRatio="none" class="adm-chart-svg">
        {#each [0, 1, 2, 3] as i}
          <line x1="0" x2={W} y1={(H / 3) * i + 8} y2={(H / 3) * i + 8}
                stroke="var(--color-border)" stroke-width="1" stroke-dasharray="2 4" />
        {/each}
        <path d={chartData.fillPath} fill="var(--color-accent)" opacity="0.14" />
        <path d={chartData.linePath} fill="none" stroke="var(--color-accent)" stroke-width="2" />
        {#each chartData.pts as [x, y]}
          <circle cx={x} cy={y} r="3" fill="var(--color-accent)" stroke="var(--color-bg)" stroke-width="2" />
        {/each}
      </svg>
    </div>
    <div class="adm-chart-axis">
      {#each weeklyClicks as _, i}
        <span>W{i + 1}</span>
      {/each}
    </div>
  </section>

  <div class="adm-grid adm-grid-2">
    <section class="adm-card">
      <header class="adm-card-header">
        <h2 class="adm-card-title">Top clubs by clicks</h2>
        <span class="adm-card-meta">Last 30 days</span>
      </header>
      {#if topClubs.length === 0}
        <p class="empty">No click data yet.</p>
      {:else}
        <ul class="adm-bars">
          {#each topClubs as club, i}
            <li class="adm-bar-row adm-bar-row-ranked">
              <div class="adm-bar-rank">{i + 1}</div>
              <div class="adm-bar-label">
                {#if club.clubSlug}
                  <a class="adm-bar-name adm-row-link" href="/{club.clubSlug}" target="_blank" rel="noopener">{club.clubName}</a>
                {:else}
                  <span class="adm-bar-name">{club.clubName}</span>
                {/if}
              </div>
              <div class="adm-bar-track">
                <div class="adm-bar-fill" style="width: {(club.clicks / maxClicks) * 100}%"></div>
              </div>
              <div class="adm-bar-value">{club.clicks.toLocaleString()}</div>
            </li>
          {/each}
        </ul>
      {/if}
    </section>

    <section class="adm-card">
      <header class="adm-card-header">
        <h2 class="adm-card-title">Traffic by weekday</h2>
        <span class="adm-card-meta">Last 8 weeks</span>
      </header>
      <div class="adm-heat">
        <div class="adm-heat-grid">
          {#each heatmap as row}
            <div class="adm-heat-row">
              {#each row as val, ci}
                {@const opacity = 0.10 + (val / heatmaxVal) * 0.85}
                <div
                  class="adm-heat-cell"
                  style="background: color-mix(in srgb, var(--color-accent) {(opacity * 100).toFixed(0)}%, transparent)"
                  title="{dayLabels[ci]}: {val} clicks"
                ></div>
              {/each}
            </div>
          {/each}
        </div>
        <div class="adm-heat-axis">
          {#each dayLabels as day}
            <span>{day}</span>
          {/each}
        </div>
        <div class="adm-heat-legend">
          <span>Less</span>
          {#each [0.15, 0.35, 0.55, 0.75, 0.95] as o}
            <span
              class="adm-heat-swatch"
              style="background: color-mix(in srgb, var(--color-accent) {o * 100}%, transparent)"
            ></span>
          {/each}
          <span>More</span>
        </div>
      </div>
    </section>
  </div>
</div>

<style>
  .empty {
    padding: var(--space-6);
    text-align: center;
    color: var(--color-text-muted);
    font-size: var(--text-sm);
  }
</style>
