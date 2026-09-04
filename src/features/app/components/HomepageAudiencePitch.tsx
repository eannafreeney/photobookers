import Button from "../../../components/app/Button";
import { NEWSLETTER_COPY } from "../../../constants/newsletter";
import { audiencePagesNav } from "../content/audiencePagesContent";

/**
 * Guest conversion block: short pitch, audience landings, one primary CTA.
 * Replaces the old collector-only SiteFeatures grid on the homepage.
 */
const HomepageAudiencePitch = () => (
  <section
    class="flex flex-col items-center gap-6 border-t-2 border-on-surface-strong py-8 text-center"
    aria-label="Who Photobookers is for"
  >
    <div class="flex max-w-2xl flex-col gap-3">
      <span class="kicker text-accent">Photobookers</span>
      <p class="font-display text-3xl font-medium leading-tight text-on-surface-strong text-balance md:text-5xl">
        A curated gathering place for photobook culture
      </p>
      <p class="text-sm text-on-surface text-pretty md:text-base">
        Start with Book of the Day — seven picks in your inbox every Wednesday.
      </p>
    </div>

    <nav
      aria-label="Audience pages"
      class="flex flex-wrap items-center justify-center gap-2"
    >
      {audiencePagesNav.map((item) => (
        <a
          href={item.href}
          class="border border-outline px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-strong transition-colors hover:border-accent hover:text-accent"
        >
          {item.label}
        </a>
      ))}
    </nav>

    <a href="/newsletter">
      <Button variant="solid" color="primary" width="auto">
        {NEWSLETTER_COPY.cta}
      </Button>
    </a>
  </section>
);

export default HomepageAudiencePitch;
