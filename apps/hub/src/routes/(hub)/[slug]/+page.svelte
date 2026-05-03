<script lang="ts">
  import { BrandLogo } from '@saltcollective/ui';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  const primary = data.club.primaryColour ?? '#68b7d2';
  const secondary = data.club.secondaryColour ?? '#f4a27e';

  function track(businessId: string, type: 'EMAIL' | 'WEBSITE' | 'PHONE') {
    fetch('/api/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessId, clubId: data.club.id, type }),
    }).catch(() => {});
  }
</script>

<div class="hub" style="--hub-primary: {primary}; --hub-secondary: {secondary}">
  <header class="header">
    <div class="header-inner">
      {#if data.club.logoUrl}
        <img src={data.club.logoUrl} alt="{data.club.name} logo" class="club-logo" />
      {:else}
        <div class="club-logo-fallback" aria-hidden="true">
          {data.club.name[0]?.toUpperCase()}
        </div>
      {/if}
      <h1 class="club-name">{data.club.name}</h1>
      {#if data.club.tagline}
        <p class="club-tagline">{data.club.tagline}</p>
      {/if}
    </div>
  </header>

  <main class="main">
    {#if data.tiers.length === 0}
      <div class="empty">
        <p>No sponsors to show yet.</p>
      </div>
    {:else}
      {#each data.tiers as tier}
        <section class="tier-section">
          <div class="inner">
            <h2 class="tier-heading">{tier.name}</h2>
            <div class="card-grid">
              {#each tier.businesses as business}
                <div class="card">
                  <div class="card-header">
                    {#if business.logoUrl}
                      <img src={business.logoUrl} alt="{business.name} logo" class="biz-logo" />
                    {:else}
                      <div class="biz-initial" aria-hidden="true">
                        {business.name[0]?.toUpperCase()}
                      </div>
                    {/if}
                    <h3 class="biz-name">{business.name}</h3>
                  </div>
                  <p class="biz-desc">{business.description}</p>
                  {#if business.websiteUrl || business.email || business.phone}
                    <div class="biz-links">
                      {#if business.websiteUrl}
                        <a
                          href={business.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          class="link-btn"
                          onclick={() => track(business.id, 'WEBSITE')}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                          Website
                        </a>
                      {/if}
                      {#if business.email}
                        <a
                          href="mailto:{business.email}"
                          class="link-btn"
                          onclick={() => track(business.id, 'EMAIL')}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                          Email
                        </a>
                      {/if}
                      {#if business.phone}
                        <a
                          href="tel:{business.phone}"
                          class="link-btn"
                          onclick={() => track(business.id, 'PHONE')}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.79a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                          Call
                        </a>
                      {/if}
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          </div>
        </section>
      {/each}
    {/if}
  </main>

  <footer class="footer">
    <a href="https://saltcollective.club" class="footer-link" aria-label="Powered by Salt Collective">
      <span class="footer-text">Powered by</span>
      <BrandLogo height={14} />
    </a>
  </footer>
</div>

<style>
  .hub {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ---- Header ---- */
  .header {
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--hub-primary) 12%, var(--color-surface)),
      color-mix(in srgb, var(--hub-secondary) 8%, var(--color-surface))
    );
    border-bottom: 1px solid var(--color-border);
    padding: var(--space-12) var(--space-6);
  }

  .header-inner {
    max-width: 960px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-4);
    text-align: center;
  }

  .club-logo {
    width: 80px;
    height: 80px;
    object-fit: contain;
    border-radius: var(--radius-lg);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
  }

  .club-logo-fallback {
    width: 80px;
    height: 80px;
    border-radius: var(--radius-lg);
    background: color-mix(in srgb, var(--hub-primary) 20%, var(--color-surface));
    border: 1px solid color-mix(in srgb, var(--hub-primary) 30%, var(--color-border));
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--text-2xl);
    font-weight: 700;
    color: var(--hub-primary);
  }

  .club-name {
    font-size: clamp(1.75rem, 5vw, 2.75rem);
    font-weight: 800;
    letter-spacing: -0.03em;
    color: var(--color-text);
    margin: 0;
    line-height: 1.1;
  }

  .club-tagline {
    font-size: var(--text-base);
    color: var(--color-text-muted);
    margin: 0;
    max-width: 480px;
    line-height: var(--leading-normal);
  }

  /* ---- Main ---- */
  .main {
    flex: 1;
  }

  .inner {
    max-width: 960px;
    margin: 0 auto;
    padding: 0 var(--space-6);
  }

  .empty {
    max-width: 960px;
    margin: var(--space-12) auto;
    padding: 0 var(--space-6);
    text-align: center;
    color: var(--color-text-muted);
    font-size: var(--text-sm);
  }

  /* ---- Tier sections ---- */
  .tier-section {
    padding: var(--space-10) 0;
    border-bottom: 1px solid var(--color-border);
  }

  .tier-section:last-child {
    border-bottom: none;
  }

  .tier-heading {
    font-size: var(--text-xs);
    font-weight: 700;
    letter-spacing: var(--tracking-eyebrow);
    text-transform: uppercase;
    color: var(--hub-primary);
    margin: 0 0 var(--space-6);
  }

  /* ---- Card grid ---- */
  .card-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-4);
  }

  .card {
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-5);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }

  .card:hover {
    border-color: color-mix(in srgb, var(--hub-primary) 40%, var(--color-border));
    box-shadow: var(--shadow-sm);
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .biz-logo {
    width: 40px;
    height: 40px;
    object-fit: contain;
    border-radius: var(--radius-md);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    flex-shrink: 0;
  }

  .biz-initial {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-md);
    background: color-mix(in srgb, var(--hub-primary) 15%, transparent);
    color: var(--hub-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: var(--text-base);
    flex-shrink: 0;
  }

  .biz-name {
    font-size: var(--text-sm);
    font-weight: 700;
    color: var(--color-text);
    margin: 0;
    line-height: var(--leading-tight);
  }

  .biz-desc {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    line-height: var(--leading-normal);
    margin: 0;
    flex: 1;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* ---- Link buttons ---- */
  .biz-links {
    display: flex;
    gap: var(--space-2);
    flex-wrap: wrap;
    margin-top: auto;
    padding-top: var(--space-1);
  }

  .link-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    padding: var(--space-1) var(--space-3);
    border-radius: var(--radius-full);
    border: 1px solid color-mix(in srgb, var(--hub-primary) 50%, transparent);
    color: var(--hub-primary);
    font-size: var(--text-xs);
    font-weight: 600;
    text-decoration: none;
    transition: background-color 0.15s ease;
  }

  .link-btn:hover {
    background: color-mix(in srgb, var(--hub-primary) 12%, transparent);
  }

  /* ---- Footer ---- */
  .footer {
    border-top: 1px solid var(--color-border);
    padding: var(--space-6);
    display: flex;
    justify-content: center;
  }

  .footer-link {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    text-decoration: none;
    opacity: 0.6;
    transition: opacity 0.15s ease;
  }

  .footer-link:hover {
    opacity: 1;
  }

  .footer-text {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
  }

  /* ---- Responsive ---- */
  @media (max-width: 820px) {
    .card-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .header {
      padding: var(--space-10) var(--space-4);
    }

    .inner {
      padding: 0 var(--space-4);
    }

    .tier-section {
      padding: var(--space-8) 0;
    }
  }

  @media (max-width: 480px) {
    .card-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
