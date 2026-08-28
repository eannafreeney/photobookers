import Button from "../../../components/app/Button";
import ScrollReveal from "../../../components/app/ScrollReveal";
import PageBleed from "../../../components/layouts/PageBleed";
import { listPublishedIssues } from "@/domain/magazine/queries";
import { isFeatureEnabled } from "@/lib/features";

/**
 * Homepage launch strip for the latest published magazine issue.
 * Ink band — breaks the cream field so it doesn't read as a second BOTD.
 */
const MagazineHomepagePromo = async () => {
  if (!isFeatureEnabled("magazine")) return <></>;

  const [error, issues] = await listPublishedIssues();
  if (error || !issues.length) return <></>;

  const issue = issues[0];
  const href = `/magazine/${issue.slug}`;
  const issueLabel =
    issue.issueNumber != null
      ? `Issue ${String(issue.issueNumber).padStart(2, "0")}`
      : (issue.kicker ?? "Latest issue");

  return (
    <ScrollReveal>
      <PageBleed>
        <section
          aria-label="Magazine"
          class="bg-on-surface-strong px-4 py-10 text-on-primary md:px-6 md:py-14"
        >
          <div class="mx-auto flex max-w-6xl flex-col items-center justify-center gap-8 md:flex-row md:gap-12">
            {issue.coverUrl ? (
              <a
                href={href}
                class="flex h-auto justify-center md:h-[400px] md:justify-end"
              >
                <img
                  src={issue.coverUrl}
                  alt={`${issueLabel}: ${issue.title}`}
                  width={1600}
                  height={1000}
                  class="h-full w-auto max-w-full object-contain"
                  loading="lazy"
                  decoding="async"
                />
              </a>
            ) : null}

            <div class="flex flex-col items-center gap-3 text-center md:items-start md:text-left">
              <span class="kicker text-accent">
                Magazine · {issueLabel}
                {issue.publishedLabel ? ` · ${issue.publishedLabel}` : ""}
              </span>
              <h2 class="font-display text-3xl font-medium leading-tight text-balance text-on-primary md:text-5xl">
                <a href={href}>{issue.title}</a>
              </h2>
              {issue.subtitle ? (
                <p class="max-w-md text-pretty text-sm text-on-primary/75 md:text-base">
                  {issue.subtitle}
                </p>
              ) : null}
              <div class="mt-3">
                <a href={href} class="group">
                  <Button variant="solid" color="alternate" width="lg">
                    <span class="inline-flex items-center">
                      Read the issue
                      <span class="w-0 overflow-hidden opacity-0 transition-all duration-300 ease-in-out group-hover:w-6 group-hover:opacity-100">
                        &nbsp;→
                      </span>
                    </span>
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>
      </PageBleed>
    </ScrollReveal>
  );
};

export default MagazineHomepagePromo;
