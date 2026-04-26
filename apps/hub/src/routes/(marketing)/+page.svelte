<script lang="ts">
  import { Button, Container, Badge } from '@saltcollective/ui';

  const features = [
    {
      title: 'Central Directory',
      description:
        'A unified hub for your club, where community members can find and connect local sponsors and businesses. ',
    },
    {
      title: 'Easy organization',
      description:
        'Collect and organize your sponsors into tiers, have your hub update immediately.',
    },
    {
      title: 'User-friendly management',
      description:
        'Mobile-friendly interface for managing your hub, ensuring quick, easy updates on the go.',
    },
    {
      title: 'Easy-to-understand pricing',
      description: 'No-nonsense, single-tier pricing to make your club hub decision simple.',
    },
    {
      title: 'Embeddable or linked',
      description:
        'Easily embed your hub on your website or share a direct link with your community.',
    },
    {
      title: 'Analytics',
      description: 'Understand engagement with the various businesses on your hub.',
    },
  ];

  const tiers = [
    {
      name: 'Single-tier pricing',
      price: '$xxx',
      period: '/year',
      description: 'Get up-and-running quickly and with no fuss.',
      items: [
        'Unlimited sponsors & businesses',
        'Customizable hub',
        'Analytics dashboard',
        'Easy-to-use management interface',
        'Quick support',
      ],
      cta: 'Get started now',
      variant: 'primary' as const,
    },
  ] as const;
</script>

<!-- ============================================================ -->
<!-- Hero                                                          -->
<!-- ============================================================ -->
<section class="hero">
  <Container>
    <div class="heroContent">
      <h1 class="heroHeading">
        The sponsor hub your
        <span class="heroAccent">club</span> deserves.
      </h1>
      <p class="heroSubheading">
        Salt Collective Club Hub provides your club with a user-friendly sponsor hub that allows
        community members to find local businesses quickly and easily.
      </p>
      <div class="heroCtas">
        <Button size="lg" href="/sign-up">Sign up</Button>
        <Button variant="ghost" size="lg" href="/#features">See how it works</Button>
      </div>
    </div>

    <!-- TODO: replace with product screenshot / hero illustration -->
    <div class="heroImage" role="presentation">
      <span class="heroImageLabel">Product screenshot</span>
    </div>
  </Container>
</section>

<!-- ============================================================ -->
<!-- Features                                                      -->
<!-- ============================================================ -->
<section id="features" class="features">
  <Container>
    <header class="sectionHeader">
      <h2 class="sectionHeading">Everything your club needs</h2>
      <p class="sectionSubheading">
        Manage your sponsors in one place and share them with your community, hassle-free. Our
        intuitive platform makes it easy to create a good looking, organized hub that keeps your
        community connected to local businesses.
      </p>
    </header>

    <div class="featureGrid">
      {#each features as feature}
        <article class="featureCard">
          <!-- TODO: replace with icon for "{feature.title}" -->
          <div class="featureIcon" aria-hidden="true"></div>
          <h3 class="featureTitle">{feature.title}</h3>
          <p class="featureDescription">{feature.description}</p>
        </article>
      {/each}
    </div>
  </Container>
</section>

<!-- ============================================================ -->
<!-- Pricing                                                       -->
<!-- ============================================================ -->
<section id="pricing" class="pricing">
  <Container>
    <header class="sectionHeader">
      <h2 class="sectionHeading">Simple, transparent pricing</h2>
      <p class="sectionSubheading">Start free. Upgrade when you're ready. No lock-in.</p>
    </header>

    <div class="pricingGrid">
      {#each tiers as tier}
        <article class="pricingCard">
          <header class="pricingHeader">
            <p class="tierName">{tier.name}</p>
            <div class="priceRow">
              <span class="price">{tier.price}</span>
              {#if tier.period}
                <span class="period">{tier.period}</span>
              {/if}
            </div>
            <p class="tierDescription">{tier.description}</p>
          </header>

          <ul class="tierFeatures">
            {#each tier.items as item}
              <li class="tierFeatureItem">
                <span class="check" aria-hidden="true">✓</span>
                {item}
              </li>
            {/each}
          </ul>

          <div class="tierCta">
            <Button variant={tier.variant} href="/sign-up">{tier.cta}</Button>
          </div>
        </article>
      {/each}
    </div>
  </Container>
</section>

<style>
  /* ============================================================ */
  /* Hero                                                          */
  /* ============================================================ */
  .hero {
    padding-block: var(--space-12) var(--space-10);
  }

  .heroContent {
    max-width: 600px;
    margin-bottom: var(--space-10);
  }

  .heroHeading {
    font-size: clamp(2.25rem, 6vw, 3.75rem);
    font-weight: 800;
    line-height: 1.1;
    letter-spacing: -0.03em;
    color: var(--color-text);
    margin: 0 0 var(--space-5);
  }

  .heroAccent {
    color: var(--color-accent);
  }

  .heroSubheading {
    font-size: var(--text-lg);
    color: var(--color-text-muted);
    line-height: var(--leading-normal);
    margin: 0 0 var(--space-8);
    max-width: 500px;
  }

  .heroCtas {
    display: flex;
    gap: var(--space-3);
    flex-wrap: wrap;
  }

  /* TODO: remove .heroImage and .heroImageLabel once replaced with real image */
  .heroImage {
    width: 100%;
    aspect-ratio: 16 / 9;
    max-height: 480px;
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border);
    background:
      linear-gradient(var(--color-border) 1px, transparent 1px),
      linear-gradient(90deg, var(--color-border) 1px, transparent 1px), var(--color-surface);
    background-size: 32px 32px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .heroImageLabel {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    padding: var(--space-2) var(--space-4);
    border: 1px dashed var(--color-border);
    border-radius: var(--radius-md);
  }

  /* ============================================================ */
  /* Shared section styles                                         */
  /* ============================================================ */
  .sectionHeader {
    text-align: center;
    margin-bottom: var(--space-10);
  }

  .sectionHeading {
    font-size: clamp(1.5rem, 4vw, 2.25rem);
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--color-text);
    margin: 0 0 var(--space-3);
  }

  .sectionSubheading {
    font-size: var(--text-lg);
    color: var(--color-text-muted);
    line-height: var(--leading-normal);
    margin: 0 auto;
    max-width: 480px;
  }

  /* ============================================================ */
  /* Features                                                      */
  /* ============================================================ */
  .features {
    background: var(--color-surface);
    border-top: 1px solid var(--color-border);
    border-bottom: 1px solid var(--color-border);
    padding-block: var(--space-12);
  }

  .featureGrid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-5);
  }

  @media (max-width: 900px) {
    .featureGrid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 560px) {
    .featureGrid {
      grid-template-columns: 1fr;
    }
  }

  .featureCard {
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-6);
  }

  /* TODO: remove .featureIcon once replaced with real icons */
  .featureIcon {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-md);
    background: color-mix(in srgb, var(--color-accent) 12%, transparent);
    border: 1px dashed color-mix(in srgb, var(--color-accent) 35%, transparent);
    margin-bottom: var(--space-4);
  }

  .featureTitle {
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--color-text);
    margin: 0 0 var(--space-2);
  }

  .featureDescription {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    line-height: var(--leading-normal);
    margin: 0;
  }

  /* ============================================================ */
  /* Pricing                                                       */
  /* ============================================================ */
  .pricing {
    padding-block: var(--space-12);
  }

  .pricingGrid {
    display: flex;
    gap: var(--space-5);
    justify-content: center;
  }

  @media (max-width: 860px) {
    .pricingGrid {
      margin-inline: auto;
    }
  }

  .pricingCard {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-6);
    position: relative;
  }

  .highlighted {
    background: var(--color-surface-2);
    border-color: var(--color-accent);
  }

  .popularBadge {
    position: absolute;
    top: calc(-1 * var(--space-4));
    left: 50%;
    transform: translateX(-50%);
    white-space: nowrap;
  }

  .pricingHeader {
    padding-top: var(--space-3);
    margin-bottom: var(--space-6);
  }

  .tierName {
    font-size: var(--text-xs);
    font-weight: 700;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin: 0 0 var(--space-3);
  }

  .priceRow {
    display: flex;
    align-items: baseline;
    gap: var(--space-1);
    margin-bottom: var(--space-3);
  }

  .price {
    font-size: var(--text-2xl);
    font-weight: 800;
    color: var(--color-text);
    letter-spacing: -0.02em;
  }

  .period {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
  }

  .tierDescription {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    line-height: var(--leading-normal);
    margin: 0;
  }

  .tierFeatures {
    list-style: none;
    padding: 0;
    margin: 0 0 var(--space-6);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    border-top: 1px solid var(--color-border);
    padding-top: var(--space-5);
  }

  .tierFeatureItem {
    display: flex;
    align-items: flex-start;
    gap: var(--space-3);
    font-size: var(--text-sm);
    color: var(--color-text);
  }

  .check {
    color: var(--color-accent);
    font-weight: 700;
    flex-shrink: 0;
    line-height: var(--leading-normal);
  }

  .tierCta :global(a),
  .tierCta :global(button) {
    width: 100%;
    justify-content: center;
  }
</style>
