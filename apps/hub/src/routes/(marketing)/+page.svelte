<script lang="ts">
  import { Button, Container } from '@saltcollective/ui';

  const features: { n: string; title: string; desc: string; cta: string | null }[] = [
    {
      n: '01',
      title: 'One tidy directory',
      desc: "Every sponsor in one place — tiers, logos, links, the works. Members find who they're looking for in two taps.",
      cta: null,
    },
    {
      n: '02',
      title: 'Drag, drop, done',
      desc: 'Re-tier a sponsor on your phone between meetings. Your hub updates the moment you do — no deploys, no fuss.',
      cta: null,
    },
    {
      n: '03',
      title: 'Embed it anywhere',
      desc: 'Drop it into your existing club site with one line, or send the link to your members. Both work the same.',
      cta: null,
    },
    {
      n: '04',
      title: 'Honest pricing',
      desc: 'One tier. One price. No upsells, no "contact us for enterprise". You always know what you\'re paying.',
      cta: null,
    },
    {
      n: '05',
      title: 'Quiet, useful analytics',
      desc: "Which sponsors get clicked? Which tiers earn their keep? Just enough numbers to make next year's pitch.",
      cta: null,
    },
    {
      n: '06',
      title: 'Real people, quick replies',
      desc: 'Stuck on something? Email us. A human writes back, usually same day, often within the hour.',
      cta: null,
    },
  ];

  const steps = [
    {
      n: '1',
      title: 'Make your hub',
      desc: "Pick a name, paste your club logo, and you've got a hub. Takes under a minute.",
    },
    {
      n: '2',
      title: 'Add your sponsors',
      desc: 'Drop in logos and links. Sort them into tiers however your club already thinks about them.',
    },
    {
      n: '3',
      title: 'Share the link',
      desc: 'Embed it on your site or post the URL in your newsletter. Everyone sees the same tidy page.',
    },
  ];

  const pricingItems = [
    'Unlimited sponsors and tiers',
    'Custom hub URL (yours.salt.club)',
    'Embed snippet for your existing site',
    'Mobile-friendly admin — works from the bleachers',
    'Engagement analytics, plain English',
    'Email support from a real human',
  ];
</script>

<!-- ============================================================ -->
<!-- Hero                                                          -->
<!-- ============================================================ -->
<section class="hero">
  <Container>
    <div class="hero-grid">
      <div class="hero-copy">
        <div class="hero-eyebrow">
          <span class="dot"></span>
          For community clubs &amp; the people who run them
        </div>
        <h1 class="hero-h1">
          <span class="line">Your sponsors</span>
          <span class="line">deserve a&nbsp;</span>
          <span class="line">
            <span class="tape tape-peach tape-rot-l">real home</span><span>.</span>
          </span>
        </h1>
        <p class="hero-sub">
          Salt Collective is the <strong>friendly hub</strong> where your community finds the local businesses
          that make your club possible. Tidy, mobile-friendly, easy-to-update, and yours to share.
        </p>
        <div class="hero-ctas">
          <Button size="lg" href="/sign-up">Start your hub</Button>
          <Button variant="ghost" size="lg" href="/#how">See how it works &rarr;</Button>
        </div>
      </div>

      <div class="hero-visual">
        <div class="postcard">
          <span class="corner-tape left"><span class="tape-strip"></span></span>
          <span class="corner-tape right"><span class="tape-strip"></span></span>

          <div class="postcard-head">
            <span>Grewstead Football Club</span>
          </div>
          <h3 class="postcard-title">Our 2026 sponsors</h3>
          <p class="postcard-meta">42 local businesses keeping us on the field</p>

          <ul class="sponsor-list">
            <li class="sponsor-row">
              <span class="sponsor-logo" style="background: #3f8fa8">NB</span>
              <span class="sponsor-name">North Bend Hardware</span>
              <span class="sponsor-tier gold">Gold</span>
            </li>
            <li class="sponsor-row">
              <span class="sponsor-logo" style="background: #d97a4f">RR</span>
              <span class="sponsor-name">River Road Coffee</span>
              <span class="sponsor-tier gold">Gold</span>
            </li>
            <li class="sponsor-row">
              <span class="sponsor-logo" style="background: #5a7a4f">WV</span>
              <span class="sponsor-name">Willow Vet Clinic</span>
              <span class="sponsor-tier silver">Silver</span>
            </li>
            <li class="sponsor-row">
              <span class="sponsor-logo" style="background: #8b5a2b">BB</span>
              <span class="sponsor-name">Birch &amp; Bramble Books</span>
              <span class="sponsor-tier bronze">Bronze</span>
            </li>
          </ul>

          <div class="postcard-foot">
            <span class="url">grewstead-football.club/sponsors</span>
            <span>+ 38 more</span>
          </div>
        </div>
      </div>
    </div>

    <svg class="doodle-arrow" viewBox="0 0 140 80" fill="none" aria-hidden="true">
      <path
        d="M5 40 C 30 20, 70 60, 120 35"
        stroke="#68B7D2"
        stroke-width="2.2"
        stroke-linecap="round"
        fill="none"
      />
      <path
        d="M115 28 L 122 36 L 113 42"
        stroke="#68B7D2"
        stroke-width="2.2"
        stroke-linecap="round"
        stroke-linejoin="round"
        fill="none"
      />
    </svg>
  </Container>
</section>

<!-- ============================================================ -->
<!-- Trust                                                         -->
<!-- ============================================================ -->
<section class="trust">
  <Container>
    <div class="trust-inner">
      <!-- <span class="trust-label">Quietly used by clubs like:</span>
      <div class="trust-logos">
        {#each trustClubs as club}
          <span class="trust-logo">{club}</span>
        {/each}
      </div> -->
    </div>
  </Container>
</section>

<!-- ============================================================ -->
<!-- Features                                                      -->
<!-- ============================================================ -->
<section id="features" class="features">
  <Container>
    <div class="section-head">
      <h2 class="section-h2">
        Everything your club needs.
        <span class="tape tape-blue tape-rot-rr">Nothing it doesn't.</span>
      </h2>
      <p class="section-sub">
        Built for volunteer treasurers and weekend admins, not enterprise procurement teams. If you
        can run a club meeting, you can run your hub.
      </p>
    </div>
    <div class="cards">
      {#each features as f}
        <article class="card">
          <span class="tape-strip" aria-hidden="true"></span>
          <div class="card-num">no. {f.n}</div>
          <h3 class="card-title">{f.title}</h3>
          <p class="card-desc">{f.desc}</p>
          {#if f.cta}
            <div class="card-foot">
              <span>{f.cta}</span>
              <span class="arrow">&rarr;</span>
            </div>
          {/if}
        </article>
      {/each}
    </div>
  </Container>
</section>

<!-- ============================================================ -->
<!-- How it works                                                  -->
<!-- ============================================================ -->
<section id="how" class="how">
  <Container>
    <div class="section-head">
      <h2 class="section-h2">
        <span class="tape tape-yellow tape-rot-r">How it works</span>
      </h2>
      <p class="section-sub">
        Three steps. No onboarding call. No "let's schedule a demo." We promise.
      </p>
    </div>
    <div class="steps">
      {#each steps as s, i}
        <article class="step step-{i + 1}">
          <span class="tape-strip" aria-hidden="true"></span>
          <span class="step-num">{s.n}.</span>
          <h3 class="step-title">{s.title}</h3>
          <p class="step-desc">{s.desc}</p>
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
    <div class="pricing-grid">
      <div class="pricing-copy">
        <h2 class="section-h2">
          One price.
          <span class="tape tape-peach tape-rot-l">No tiers.</span>
        </h2>
        <p class="section-sub">
          One honest yearly fee, no add-ons, no "starting at," no "contact sales." If you grow, we
          don't change the bill.
        </p>
        <ul class="pricing-items">
          {#each pricingItems as item}
            <li>
              <span class="check">✓</span>
              {item}
            </li>
          {/each}
        </ul>
      </div>

      <div class="price-card">
        <div class="price-tape">
          <span class="tape tape-yellow tape-rot-r">For your whole club</span>
        </div>
        <div class="price-eyebrow">The whole thing</div>
        <div class="price-row">
          <span class="price-amt">$XXX </span>
          <span class="price-period">/ year</span>
        </div>
        <p class="price-desc">
          That's about <strong>$XX a month</strong>. One sponsor renewal pays for the whole year.
        </p>
        <div class="price-cta">
          <Button size="lg" href="/sign-up">Start your hub</Button>
        </div>
        <!-- <p class="price-foot">30-day refund, no questions, no forms.</p> -->
      </div>
    </div>
  </Container>
</section>

<!-- ============================================================ -->
<!-- Signoff                                                       -->
<!-- ============================================================ -->
<section id="contact" class="signoff">
  <Container>
    <h2>
      Give your sponsors
      <span class="tape tape-blue tape-rot-rr">a real home</span>.
    </h2>
    <p>Set up a hub this afternoon. We'll be here if you get stuck.</p>
    <div class="signoff-ctas">
      <Button size="lg" href="/sign-up">Start your hub</Button>
      <Button variant="ghost" size="lg" href="/#features">Have another look</Button>
    </div>
    <div class="signature">— the Salt Collective team</div>
  </Container>
</section>

<style>
  /* ============================================================ */
  /* Tape labels — the headline treatment (marketing only)        */
  /* ============================================================ */
  .tape {
    --rot: -2deg;
    display: inline-block;
    position: relative;
    background: var(--tape);
    color: var(--tape-ink);
    padding: 0.45em 0.9em 0.4em;
    font-weight: 700;
    letter-spacing: -0.01em;
    transform: rotate(var(--rot));
    -webkit-mask-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none' viewBox='0 0 100 30'><path d='M0,3 L4,1 L9,4 L14,2 L20,3 L26,1 L33,3 L40,2 L48,4 L55,2 L62,3 L70,1 L77,4 L84,2 L91,3 L97,1 L100,3 L100,27 L96,28 L91,26 L84,29 L77,27 L70,29 L62,27 L55,29 L48,26 L40,28 L33,27 L26,29 L20,28 L14,29 L9,27 L4,29 L0,27 Z' fill='black'/></svg>");
    mask-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none' viewBox='0 0 100 30'><path d='M0,3 L4,1 L9,4 L14,2 L20,3 L26,1 L33,3 L40,2 L48,4 L55,2 L62,3 L70,1 L77,4 L84,2 L91,3 L97,1 L100,3 L100,27 L96,28 L91,26 L84,29 L77,27 L70,29 L62,27 L55,29 L48,26 L40,28 L33,27 L26,29 L20,28 L14,29 L9,27 L4,29 L0,27 Z' fill='black'/></svg>");
    -webkit-mask-size: 100% 100%;
    mask-size: 100% 100%;
    -webkit-mask-repeat: no-repeat;
    mask-repeat: no-repeat;
    filter: drop-shadow(0 4px 6px rgba(15, 15, 25, 0.12))
      drop-shadow(0 1px 1px rgba(15, 15, 25, 0.08));
  }

  .tape::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.22), rgba(0, 0, 0, 0.06));
    pointer-events: none;
    mix-blend-mode: overlay;
  }

  /* Tape colour variants — dark mode defaults, light overrides */
  .tape-peach {
    --tape: #e8b888;
  }
  .tape-blue {
    --tape: #a8c8d6;
  }
  .tape-yellow {
    --tape: #e8d27a;
  }

  @media (prefers-color-scheme: light) {
    .tape-peach {
      --tape: #f4d9b3;
      --tape-edge: #e8c594;
    }
    .tape-blue {
      --tape: #c5e0eb;
      --tape-edge: #a9cfdf;
    }
    .tape-yellow {
      --tape: #f6e7a8;
      --tape-edge: #e9d57a;
    }
  }

  /* Rotation variants */
  .tape-rot-r {
    --rot: 1.5deg;
  }
  .tape-rot-l {
    --rot: -2.2deg;
  }
  .tape-rot-rr {
    --rot: 2.8deg;
  }
  .tape-rot-ll {
    --rot: -3.2deg;
  }
  .tape-flat {
    --rot: -0.4deg;
  }

  /* Thin decorative strip (no text, used on cards & postcard) */
  .tape-strip {
    position: absolute;
    width: 90px;
    height: 18px;
    background: var(--tape);
    border-radius: 2px;
    opacity: 0.82;
    box-shadow: 0 2px 4px rgba(15, 15, 25, 0.14);
  }

  /* ============================================================ */
  /* Hero                                                          */
  /* ============================================================ */
  .hero {
    padding-block: var(--space-12);
    position: relative;
    overflow: hidden;
  }

  .hero::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background-image: radial-gradient(
      circle at 1px 1px,
      color-mix(in srgb, var(--ink) 8%, transparent) 1px,
      transparent 0
    );
    background-size: 22px 22px;
    opacity: 0.35;
    mask-image: linear-gradient(180deg, black 60%, transparent);
    -webkit-mask-image: linear-gradient(180deg, black 60%, transparent);
  }

  .hero-grid {
    position: relative;
    display: grid;
    grid-template-columns: 1.05fr 0.95fr;
    gap: var(--space-12);
    align-items: center;
  }

  @media (max-width: 900px) {
    .hero-grid {
      grid-template-columns: 1fr;
      gap: var(--space-10);
    }
  }

  .hero-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: var(--text-sm);
    font-weight: 600;
    color: color-mix(in srgb, var(--ink) 70%, transparent);
    margin-bottom: var(--space-5);
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: var(--color-accent-2);
    display: inline-block;
    flex-shrink: 0;
  }

  .hero-h1 {
    font-size: clamp(2.5rem, 6.4vw, 4.4rem);
    font-weight: 800;
    line-height: 1.02;
    letter-spacing: -0.035em;
    color: var(--ink);
    margin: 0;
  }

  .line {
    display: block;
  }

  .hero-h1 .tape {
    font-size: 0.78em;
    vertical-align: 0.05em;
    margin: 0 0.1em;
  }

  .hero-sub {
    font-size: var(--text-lg);
    color: color-mix(in srgb, var(--ink) 65%, transparent);
    line-height: 1.55;
    margin: var(--space-6) 0 var(--space-8);
    max-width: 30em;
  }

  .hero-sub strong {
    color: var(--ink);
    font-weight: 600;
  }

  .hero-ctas {
    display: flex;
    gap: var(--space-3);
    flex-wrap: wrap;
    align-items: center;
  }

  .hero-meta {
    margin-top: var(--space-6);
    font-size: var(--text-sm);
    color: color-mix(in srgb, var(--ink) 55%, transparent);
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  .check {
    width: 18px;
    height: 18px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--color-accent) 20%, transparent);
    color: var(--color-accent);
    display: inline-grid;
    place-items: center;
    font-size: 11px;
    font-weight: 800;
    flex-shrink: 0;
  }

  /* ---- Postcard ---- */
  .postcard {
    position: relative;
    background: var(--paper-card);
    border: 1px solid color-mix(in srgb, var(--ink) 18%, transparent);
    border-radius: 6px;
    padding: 18px 18px 16px;
    box-shadow:
      0 22px 40px -18px rgba(15, 15, 25, 0.25),
      0 4px 10px -4px rgba(15, 15, 25, 0.12);
    transform: rotate(1.6deg);
    max-width: 460px;
    margin-left: auto;
  }

  .corner-tape {
    position: absolute;
    top: -12px;
    width: 90px;
    height: 22px;
  }

  .corner-tape.left {
    left: -18px;
    transform: rotate(-12deg);
  }
  .corner-tape.right {
    right: -18px;
    transform: rotate(10deg);
  }

  .postcard-head {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: var(--text-xs);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: color-mix(in srgb, var(--ink) 55%, transparent);
    font-weight: 700;
    margin-bottom: 12px;
  }

  .stamp {
    margin-left: auto;
    border: 1.5px dashed color-mix(in srgb, var(--ink) 35%, transparent);
    color: color-mix(in srgb, var(--ink) 70%, transparent);
    padding: 2px 8px;
    border-radius: 3px;
    font-size: 10px;
    letter-spacing: 0.08em;
    transform: rotate(-6deg);
  }

  .postcard-title {
    font-size: 1.05rem;
    font-weight: 700;
    margin: 0 0 2px;
    color: var(--ink);
  }

  .postcard-meta {
    font-size: var(--text-sm);
    color: color-mix(in srgb, var(--ink) 55%, transparent);
    margin: 0 0 14px;
  }

  .sponsor-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .sponsor-row {
    display: grid;
    grid-template-columns: 36px 1fr auto;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    background: var(--paper-card-2);
    border: 1px solid color-mix(in srgb, var(--ink) 12%, transparent);
    border-radius: 8px;
  }

  .sponsor-logo {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: grid;
    place-items: center;
    font-weight: 800;
    font-size: 14px;
    color: white;
  }

  .sponsor-name {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--ink);
  }

  .sponsor-tier {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 3px 8px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--color-accent) 15%, transparent);
    color: var(--color-accent);
  }

  /* Default = dark */
  .sponsor-tier.gold {
    background: #4a3a18;
    color: #f4d57a;
  }
  .sponsor-tier.silver {
    background: #2c2c30;
    color: #b8b8c0;
  }
  .sponsor-tier.bronze {
    background: #3a2a1c;
    color: #d4a878;
  }

  @media (prefers-color-scheme: light) {
    .sponsor-tier.gold {
      background: #fff1c9;
      color: #8a6a18;
    }
    .sponsor-tier.silver {
      background: #ececf0;
      color: #4d4d56;
    }
    .sponsor-tier.bronze {
      background: #f5dcc7;
      color: #8b5a2b;
    }
  }

  .postcard-foot {
    margin-top: 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: var(--text-xs);
    color: color-mix(in srgb, var(--ink) 50%, transparent);
  }

  .url {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  }

  /* Doodle arrow (hidden at smaller breakpoints) */
  .doodle-arrow {
    position: absolute;
    width: 140px;
    height: 80px;
    pointer-events: none;
    top: 26%;
    left: 44%;
    transform: rotate(-8deg);
  }

  @media (max-width: 1100px) {
    .doodle-arrow {
      display: none;
    }
  }

  /* ============================================================ */
  /* Shared section header                                         */
  /* ============================================================ */
  .section-head {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-4);
    margin-bottom: var(--space-12);
    max-width: 38rem;
  }

  .section-h2 {
    font-size: clamp(2rem, 5vw, 3rem);
    font-weight: 800;
    letter-spacing: -0.03em;
    line-height: 1.05;
    color: var(--ink);
    margin: 0;
  }

  .section-sub {
    font-size: var(--text-lg);
    color: color-mix(in srgb, var(--ink) 60%, transparent);
    line-height: 1.55;
    margin: 0;
  }

  /* ============================================================ */
  /* Trust strip                                                   */
  /* ============================================================ */
  .trust {
    padding-block: var(--space-8);
    border-top: 1px dashed color-mix(in srgb, var(--ink) 18%, transparent);
    border-bottom: 1px dashed color-mix(in srgb, var(--ink) 18%, transparent);
    background: var(--paper-2);
  }

  .trust-inner {
    display: flex;
    align-items: center;
    gap: var(--space-8);
    flex-wrap: wrap;
  }

  .trust-label {
    font-size: var(--text-sm);
    color: color-mix(in srgb, var(--ink) 60%, transparent);
    font-style: italic;
  }

  .trust-logos {
    display: flex;
    gap: var(--space-8);
    flex: 1;
    flex-wrap: wrap;
  }

  .trust-logo {
    font-weight: 700;
    font-size: 0.95rem;
    color: color-mix(in srgb, var(--ink) 50%, transparent);
    letter-spacing: -0.01em;
  }

  /* ============================================================ */
  /* Features — index cards                                        */
  /* ============================================================ */
  .features {
    padding-block: var(--space-12);
    position: relative;
  }

  .cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-8) var(--space-6);
  }

  @media (max-width: 900px) {
    .cards {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  @media (max-width: 560px) {
    .cards {
      grid-template-columns: 1fr;
    }
  }

  .card {
    position: relative;
    background: var(--paper-card);
    border: 1px solid color-mix(in srgb, var(--ink) 14%, transparent);
    border-radius: 6px;
    padding: 32px 22px 22px;
    box-shadow:
      0 14px 28px -16px rgba(15, 15, 25, 0.22),
      0 2px 6px -2px rgba(15, 15, 25, 0.1);
    transition: transform 0.2s ease;
  }

  .card:hover {
    transform: translateY(-3px) rotate(0deg) !important;
  }

  .card:nth-child(6n + 1) {
    transform: rotate(-1.2deg);
  }
  .card:nth-child(6n + 2) {
    transform: rotate(0.8deg);
  }
  .card:nth-child(6n + 3) {
    transform: rotate(-0.6deg);
  }
  .card:nth-child(6n + 4) {
    transform: rotate(1.4deg);
  }
  .card:nth-child(6n + 5) {
    transform: rotate(-1.6deg);
  }
  .card:nth-child(6n + 6) {
    transform: rotate(0.5deg);
  }

  .card .tape-strip {
    top: -10px;
    left: 50%;
    transform: translateX(-50%) rotate(-3deg);
    width: 110px;
    height: 22px;
  }

  .card:nth-child(2n) .tape-strip {
    transform: translateX(-50%) rotate(2.5deg);
  }

  .card-num {
    font-family: ui-serif, Georgia, 'Times New Roman', serif;
    font-style: italic;
    font-size: var(--text-sm);
    color: color-mix(in srgb, var(--ink) 45%, transparent);
    margin-bottom: 6px;
  }

  .card-title {
    font-size: 1.4rem;
    font-weight: 800;
    margin: 0 0 8px;
    letter-spacing: -0.02em;
    color: var(--ink);
  }

  .card-desc {
    font-size: var(--text-base);
    line-height: 1.55;
    color: color-mix(in srgb, var(--ink) 65%, transparent);
    margin: 0 0 14px;
  }

  .card-foot {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--color-accent);
    padding-top: 12px;
    border-top: 1px dashed color-mix(in srgb, var(--ink) 18%, transparent);
  }

  .arrow {
    transition: transform 0.15s ease;
  }

  .card:hover .arrow {
    transform: translateX(3px);
  }

  /* ============================================================ */
  /* How it works — taped steps                                   */
  /* ============================================================ */
  .how {
    padding-block: var(--space-12);
    background: var(--paper-2);
    border-top: 1px dashed color-mix(in srgb, var(--ink) 18%, transparent);
    border-bottom: 1px dashed color-mix(in srgb, var(--ink) 18%, transparent);
  }

  .steps {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-8);
  }

  @media (max-width: 900px) {
    .steps {
      grid-template-columns: 1fr;
    }
  }

  .step {
    position: relative;
    background: var(--paper-card-2);
    border: 1px solid color-mix(in srgb, var(--ink) 14%, transparent);
    padding: 28px 22px 20px;
    box-shadow: 0 12px 22px -14px rgba(15, 15, 25, 0.2);
  }

  .step-1 {
    transform: rotate(-0.8deg);
  }
  .step-2 {
    transform: rotate(0.5deg);
  }
  .step-3 {
    transform: rotate(-1.1deg);
  }

  .step .tape-strip {
    top: -12px;
    left: 24px;
    width: 96px;
    height: 22px;
    transform: rotate(-6deg);
  }

  .step-2 .tape-strip {
    transform: rotate(7deg);
    left: auto;
    right: 24px;
  }

  .step-num {
    font-family: ui-serif, Georgia, serif;
    font-style: italic;
    font-weight: 700;
    font-size: 2.2rem;
    line-height: 1;
    color: var(--color-accent);
    margin-bottom: 8px;
    display: inline-block;
  }

  .step-title {
    font-size: 1.25rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--ink);
    margin: 0 0 6px;
  }

  .step-desc {
    font-size: var(--text-base);
    line-height: 1.5;
    color: color-mix(in srgb, var(--ink) 65%, transparent);
    margin: 0;
  }

  /* ============================================================ */
  /* Pricing — sticker card                                        */
  /* ============================================================ */
  .pricing {
    padding-block: var(--space-12);
  }

  .pricing-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-12);
    align-items: center;
  }

  @media (max-width: 900px) {
    .pricing-grid {
      grid-template-columns: 1fr;
      gap: var(--space-10);
    }
  }

  .pricing-copy .section-h2 {
    margin-bottom: var(--space-5);
  }

  .pricing-items {
    list-style: none;
    padding: 0;
    margin: var(--space-6) 0 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .pricing-items li {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: var(--text-base);
    color: var(--ink);
  }

  .pricing-items .check {
    flex-shrink: 0;
    width: 22px;
    height: 22px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--color-accent) 18%, transparent);
    color: var(--color-accent);
    font-weight: 800;
    font-size: 12px;
    display: grid;
    place-items: center;
  }

  .price-card {
    position: relative;
    background: var(--paper-card);
    border: 1.5px solid color-mix(in srgb, var(--ink) 70%, transparent);
    border-radius: 8px;
    padding: 36px 32px 30px;
    box-shadow:
      6px 6px 0 var(--color-accent),
      0 18px 30px -18px rgba(15, 15, 25, 0.25);
    max-width: 420px;
    margin-inline: auto;
    transform: rotate(-1.2deg);
  }

  .price-tape {
    position: absolute;
    top: -18px;
    left: 50%;
    transform: translateX(-50%) rotate(-3deg);
  }

  .price-eyebrow {
    font-size: var(--text-xs);
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: color-mix(in srgb, var(--ink) 55%, transparent);
    margin-bottom: 14px;
  }

  .price-row {
    display: flex;
    align-items: baseline;
    gap: 6px;
    margin-bottom: 8px;
  }

  .price-amt {
    font-size: 4rem;
    font-weight: 800;
    letter-spacing: -0.04em;
    line-height: 1;
    color: var(--ink);
  }

  .strike {
    font-size: 0.6em;
    color: color-mix(in srgb, var(--ink) 35%, transparent);
    text-decoration: line-through;
    text-decoration-color: var(--pin);
    text-decoration-thickness: 2px;
    margin-right: 0.2em;
    font-weight: 700;
  }

  .price-period {
    font-size: var(--text-base);
    color: color-mix(in srgb, var(--ink) 55%, transparent);
  }

  .price-desc {
    font-size: var(--text-sm);
    color: color-mix(in srgb, var(--ink) 60%, transparent);
    margin: 0 0 22px;
    line-height: 1.5;
  }

  .price-desc strong {
    color: var(--ink);
  }

  .price-cta :global(.button) {
    width: 100%;
    justify-content: center;
  }

  .price-foot {
    margin-top: 14px;
    text-align: center;
    font-size: var(--text-xs);
    color: color-mix(in srgb, var(--ink) 50%, transparent);
    font-style: italic;
  }

  /* ============================================================ */
  /* Signoff                                                       */
  /* ============================================================ */
  .signoff {
    padding-block: var(--space-12);
    text-align: center;
  }

  .signoff h2 {
    font-size: clamp(2rem, 5vw, 3.2rem);
    font-weight: 800;
    letter-spacing: -0.03em;
    line-height: 1.1;
    margin: 0 0 var(--space-5);
    color: var(--ink);
  }

  .signoff p {
    font-size: var(--text-lg);
    color: color-mix(in srgb, var(--ink) 60%, transparent);
    margin: 0 0 var(--space-8);
    max-width: 36em;
    margin-inline: auto;
  }

  .signoff-ctas {
    display: flex;
    gap: var(--space-3);
    justify-content: center;
    flex-wrap: wrap;
    margin-bottom: var(--space-8);
  }

  .signature {
    font-family: 'Caveat', 'Bradley Hand', cursive;
    font-size: 1.6rem;
    color: color-mix(in srgb, var(--ink) 70%, transparent);
    display: inline-block;
    transform: rotate(-3deg);
  }
</style>
