import SectionTitle from "../../../components/app/SectionTitle";
import Button from "../../../components/app/Button";
import {
  aboutAudienceNav,
  aboutAudienceSections,
  aboutDifferentiators,
  aboutEditorialLinks,
  aboutPageMeta,
} from "../content/aboutPageContent";

const textLinkClass =
  "underline decoration-accent underline-offset-4 hover:text-accent";

const AboutPageContent = () => (
  <div class="mx-auto flex w-full max-w-2xl flex-col gap-10">
    <p class="text-base leading-relaxed text-on-surface">{aboutPageMeta.lead}</p>

    <nav
      aria-label="Audience sections"
      class="flex flex-wrap gap-2 border-y border-outline py-4"
    >
      {aboutAudienceNav.map((item) => (
        <a
          href={`#${item.id}`}
          class="rounded-full border border-outline px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-strong transition-colors hover:border-accent hover:text-accent"
        >
          {item.label}
        </a>
      ))}
    </nav>

    {aboutAudienceSections.map((section) => (
      <section
        id={section.id}
        class="flex scroll-mt-24 flex-col gap-4 border-t border-outline pt-8"
      >
        <SectionTitle className="mb-0 mt-0" kicker={section.kicker}>
          {section.title}
        </SectionTitle>
        <p class="text-base leading-relaxed text-on-surface">{section.intro}</p>
        <ul class="flex list-disc flex-col gap-2 pl-5 text-base leading-relaxed text-on-surface">
          {section.bullets.map((bullet) => (
            <li>{bullet}</li>
          ))}
        </ul>
        <p class="text-base leading-relaxed text-on-surface">{section.closing}</p>
        <div class="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap sm:items-center">
          <a href={section.primaryCta.href}>
            <Button variant="solid" color="primary" width="auto" type="button">
              {section.primaryCta.label}
            </Button>
          </a>
          {section.secondaryCtas.map((cta) => (
            <a
              href={cta.href}
              class={`text-sm font-medium text-on-surface-strong ${textLinkClass}`}
            >
              {cta.label}
            </a>
          ))}
        </div>
      </section>
    ))}

    <section
      id="why-here"
      class="flex scroll-mt-24 flex-col gap-4 border-t border-outline pt-8"
    >
      <SectionTitle className="mb-0 mt-0" kicker={aboutDifferentiators.kicker}>
        {aboutDifferentiators.title}
      </SectionTitle>
      <p class="text-base leading-relaxed text-on-surface">
        {aboutDifferentiators.body}
      </p>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {aboutDifferentiators.pillars.map((pillar) => (
          <div class="flex flex-col gap-1 border-t-2 border-on-surface-strong pt-3">
            <h3 class="font-display text-lg font-medium text-on-surface-strong">
              {pillar.title}
            </h3>
            <p class="text-sm leading-relaxed text-on-surface">
              {pillar.description}
            </p>
          </div>
        ))}
      </div>
    </section>

    <section class="flex flex-col gap-3 border-t border-outline pt-8">
      <SectionTitle className="mb-0 mt-0" kicker="Every week">
        An editorial rhythm
      </SectionTitle>
      <p class="text-base leading-relaxed text-on-surface">
        Every day we feature a{" "}
        <a href={aboutEditorialLinks[0].href} class={textLinkClass}>
          {aboutEditorialLinks[0].label}
        </a>
        , and every week an{" "}
        <a href={aboutEditorialLinks[1].href} class={textLinkClass}>
          {aboutEditorialLinks[1].label}
        </a>{" "}
        and a{" "}
        <a href={aboutEditorialLinks[2].href} class={textLinkClass}>
          {aboutEditorialLinks[2].label}
        </a>
        , alongside{" "}
        <a href={aboutEditorialLinks[3].href} class={textLinkClass}>
          {aboutEditorialLinks[3].label}
        </a>{" "}
        with the people behind the books. The best way to keep up is the{" "}
        <a href={aboutEditorialLinks[4].href} class={textLinkClass}>
          {aboutEditorialLinks[4].label}
        </a>
        .
      </p>
    </section>
  </div>
);

export default AboutPageContent;
