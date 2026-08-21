import Button from "../../../components/app/Button";
import SectionTitle from "../../../components/app/SectionTitle";
import {
  audiencePagesNav,
  type AudiencePageContent,
} from "../content/audiencePagesContent";

const textLinkClass =
  "underline decoration-accent underline-offset-4 hover:text-accent";

type AudienceLandingContentProps = {
  page: AudiencePageContent;
};

const AudienceLandingContent = ({ page }: AudienceLandingContentProps) => (
  <div class="mx-auto flex w-full max-w-2xl flex-col gap-10">
    <nav
      aria-label="Audience pages"
      class="flex flex-wrap gap-2 border-y border-outline py-4"
    >
      {audiencePagesNav.map((item) => {
        const isCurrent = item.id === page.id;
        return (
          <a
            href={item.href}
            aria-current={isCurrent ? "page" : undefined}
            class={
              isCurrent
                ? "border border-on-surface-strong bg-surface-alt px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-strong"
                : "border border-outline px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-strong transition-colors hover:border-accent hover:text-accent"
            }
          >
            {item.label}
          </a>
        );
      })}
    </nav>

    <section class="flex flex-col gap-6">
      <SectionTitle className="mb-0 mt-0" kicker={page.featuresKicker}>
        {page.featuresTitle}
      </SectionTitle>
      <ol class="flex flex-col gap-6">
        {page.features.map((feature, index) => (
          <li class="flex gap-4 border-t-2 border-on-surface-strong pt-3">
            <span class="kicker shrink-0 text-accent pt-1">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div class="flex min-w-0 flex-col gap-1">
              <h3 class="font-display text-lg font-medium text-on-surface-strong">
                {feature.title}
              </h3>
              <p class="text-base leading-relaxed text-on-surface">
                {feature.description}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>

    <section class="flex flex-col gap-4 border-t border-outline pt-8">
      <SectionTitle className="mb-0 mt-0" kicker={page.benefitsKicker}>
        {page.benefitsTitle}
      </SectionTitle>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {page.benefits.map((benefit) => (
          <div class="flex flex-col gap-1 border-t-2 border-on-surface-strong pt-3">
            <h3 class="font-display text-lg font-medium text-on-surface-strong">
              {benefit.title}
            </h3>
            <p class="text-sm leading-relaxed text-on-surface">
              {benefit.description}
            </p>
          </div>
        ))}
      </div>
    </section>

    <section class="flex flex-col gap-4 border-t border-outline pt-8">
      <p class="text-base leading-relaxed text-on-surface">{page.closing}</p>
      <div class="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap sm:items-center">
        <a href={page.primaryCta.href}>
          <Button variant="solid" color="primary" width="auto" type="button">
            {page.primaryCta.label}
          </Button>
        </a>
        {page.secondaryCtas.map((cta) => (
          <a
            href={cta.href}
            target={cta.external ? "_blank" : undefined}
            rel={cta.external ? "noopener noreferrer" : undefined}
            class={`text-sm font-medium text-on-surface-strong ${textLinkClass}`}
          >
            {cta.label}
          </a>
        ))}
      </div>
      <p class="pt-2 text-sm text-on-surface">
        Or read more{" "}
        <a href="/about" class={textLinkClass}>
          about Photobookers
        </a>
        .
      </p>
    </section>
  </div>
);

export default AudienceLandingContent;
