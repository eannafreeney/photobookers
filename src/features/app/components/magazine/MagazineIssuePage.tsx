import clsx from "clsx";
import PageHeader from "@/components/app/PageHeader";
import SectionTitle from "@/components/app/SectionTitle";
import Link from "@/components/app/Link";
import type {
  MagazineIssuePlacement,
  MagazineIssueView,
} from "@/domain/magazine/queries";

type Props = {
  issue: MagazineIssueView;
};

const proseClass =
  "text-lg leading-relaxed text-balance text-on-surface text-pretty font-display";
const navChipClass =
  "rounded-full border border-outline px-3 py-1 text-xs font-semibold text-on-surface transition-colors hover:border-accent hover:text-accent";

const MagazineIssuePage = ({ issue }: Props) => {
  const placements = issue.placements.filter((p) => p.book);
  const bookCount = placements.length;

  const placementsByMovement = new Map<string, MagazineIssuePlacement[]>();
  const ungrouped: MagazineIssuePlacement[] = [];
  const movementIds = new Set(issue.movements.map((m) => m.id));
  for (const placement of placements) {
    if (placement.movementId && movementIds.has(placement.movementId)) {
      const list = placementsByMovement.get(placement.movementId) ?? [];
      list.push(placement);
      placementsByMovement.set(placement.movementId, list);
    } else {
      ungrouped.push(placement);
    }
  }

  return (
    <div class="mx-auto flex w-full max-w-3xl flex-col gap-10">
      {issue.bannerUrl ? (
        <figure class="flex flex-col gap-2">
          <img
            src={issue.bannerUrl}
            alt={`${issue.kicker ?? "Issue"}: ${issue.title}`}
            width={1600}
            height={560}
            class="h-56 w-full border border-outline object-cover md:h-80"
          />
        </figure>
      ) : null}

      <PageHeader
        kicker={issue.kicker ?? undefined}
        title={issue.title}
        intro={issue.subtitle ?? undefined}
      />

      <p class="text-sm text-on-surface">
        {[
          issue.publishedLabel,
          issue.readingMinutes ? `${issue.readingMinutes} min read` : null,
          `${bookCount} books`,
        ]
          .filter(Boolean)
          .join(" · ")}
      </p>

      {issue.movements.length > 0 ? (
        <nav
          aria-label="Issue sections"
          class="flex flex-wrap gap-2 border-y border-outline py-4"
        >
          <a href="#editors-letter" class={navChipClass}>
            Letter
          </a>
          {issue.movements.map((movement) => (
            <a href={`#${movement.id}`} class={navChipClass}>
              {movement.kicker || movement.title}
            </a>
          ))}
        </nav>
      ) : null}

      {issue.editorsLetter.length > 0 ? (
        <section
          id="editors-letter"
          class="scroll-mt-24 mx-auto flex max-w-xl flex-col gap-4 border-t border-outline pt-8"
        >
          <SectionTitle className="mb-0 mt-0" kicker="Editor's letter">
            {issue.editorsLetterTitle ?? "Editor's letter"}
          </SectionTitle>
          {issue.editorsLetter.map((paragraph) => (
            <p class={proseClass}>{paragraph}</p>
          ))}
          <p class="font-display text-lg italic text-on-surface-weak">
            — The editors, Photobookers
          </p>
        </section>
      ) : null}

      {issue.movements.map((movement) => {
        const items = placementsByMovement.get(movement.id) ?? [];
        if (items.length === 0) return null;
        return (
          <section
            id={movement.id}
            class="scroll-mt-24 flex flex-col gap-6 border-t border-outline pt-8"
          >
            <div class="flex flex-col gap-1">
              {movement.kicker ? (
                <span class="kicker text-accent">{movement.kicker}</span>
              ) : null}
              <h2 class="font-display text-2xl font-medium text-on-surface-strong text-balance md:text-3xl">
                {movement.lead ? (
                  <span class="italic text-accent">{movement.lead} </span>
                ) : null}
                {movement.title}
              </h2>
            </div>
            {movement.paragraphs.map((paragraph) => (
              <p class={proseClass}>{paragraph}</p>
            ))}
            <div class="flex flex-col">
              {items.map((placement) => (
                <MagazineBookPlate
                  key={placement.bookId}
                  placement={placement}
                  align={placement.number % 2 === 1 ? "left" : "right"}
                />
              ))}
            </div>
          </section>
        );
      })}

      {ungrouped.length > 0 ? (
        <section class="flex flex-col border-t border-outline pt-8">
          {ungrouped.map((placement) => (
            <MagazineBookPlate
              key={placement.bookId}
              placement={placement}
              align={placement.number % 2 === 1 ? "left" : "right"}
            />
          ))}
        </section>
      ) : null}

      <ContributorsAndShare placements={placements} />
    </div>
  );
};

const MagazineBookPlate = ({
  placement,
  align,
}: {
  placement: MagazineIssuePlacement;
  align: "left" | "right";
}) => {
  const { book, number } = placement;
  const title = book?.title ?? "Untitled";
  const artist = book?.artist;
  const isVerified = artist?.status === "verified";
  const href = book ? `/books/${book.slug}` : "#";
  const isRight = align === "right";

  return (
    <aside
      class={clsx(
        "my-8 w-full border border-outline bg-surface-alt/50 p-5 md:w-4/5",
        isRight ? "md:ml-auto" : "md:mr-auto",
      )}
    >
      <div
        class={clsx(
          "flex flex-col gap-5 sm:flex-row sm:items-stretch",
          isRight && "sm:flex-row-reverse sm:text-right",
        )}
      >
        {book?.coverUrl ? (
          <Link
            href={href}
            className="block w-full shrink-0 overflow-hidden border border-outline bg-surface no-underline sm:w-2/5"
          >
            <img
              src={book.coverUrl}
              alt={`Cover of ${title}`}
              loading="lazy"
              class="h-full min-h-64 w-full object-cover"
            />
          </Link>
        ) : (
          <div class="flex min-h-64 w-full shrink-0 items-center justify-center border border-outline bg-surface text-xs text-on-surface-weak sm:w-2/5">
            No cover
          </div>
        )}
        <div class="flex min-w-0 flex-col justify-center gap-2">
          <div
            class={clsx(
              "flex items-center gap-2",
              isRight && "sm:flex-row-reverse",
            )}
          >
            <span class="h-px w-6 bg-accent" />
            <span class="kicker text-accent">Book {number}</span>
          </div>
          <h3 class="font-display text-xl font-medium text-on-surface-strong text-balance">
            <Link href={href} className="hover:text-accent no-underline">
              {title}
            </Link>
          </h3>
          <div
            class={clsx(
              "flex flex-wrap items-center gap-2",
              isRight && "sm:justify-end",
            )}
          >
            {artist?.displayName ? (
              artist.slug ? (
                <Link
                  href={`/creators/${artist.slug}`}
                  className="text-sm font-semibold text-on-surface-strong hover:text-accent no-underline"
                >
                  {artist.displayName}
                </Link>
              ) : (
                <span class="text-sm font-semibold text-on-surface-strong">
                  {artist.displayName}
                </span>
              )
            ) : null}
            {isVerified ? (
              <span class="inline-flex items-center gap-1 rounded-full border border-[#4f7a4a]/40 bg-[#4f7a4a]/10 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider text-[#4f7a4a]">
                ✦ Verified
              </span>
            ) : (
              <span class="inline-flex items-center gap-1 rounded-full border border-dashed border-on-surface-weak px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider text-on-surface-weak">
                Unclaimed ·{" "}
                <Link href={href} className="text-accent no-underline">
                  invite
                </Link>
              </span>
            )}
          </div>
          {placement.blurb ? (
            <p class="text-sm leading-relaxed text-on-surface text-pretty">
              {placement.blurb}
            </p>
          ) : null}
          {placement.artistQuote ? (
            <blockquote
              class={clsx(
                "text-sm italic leading-relaxed text-on-surface",
                isRight
                  ? "border-r-2 border-accent pr-4"
                  : "border-l-2 border-accent pl-4",
              )}
            >
              <span class="not-italic font-semibold text-accent">
                From the artist:{" "}
              </span>
              {placement.artistQuote}
            </blockquote>
          ) : placement.artistPrompt ? (
            <blockquote
              class={clsx(
                "text-sm italic leading-relaxed text-on-surface",
                isRight
                  ? "border-r-2 border-accent pr-4"
                  : "border-l-2 border-accent pl-4",
              )}
            >
              <span class="not-italic font-semibold text-on-surface-strong">
                For the artist:{" "}
              </span>
              {placement.artistPrompt}
            </blockquote>
          ) : null}
          <Link
            href={href}
            className="text-sm font-medium text-on-surface-strong underline decoration-accent underline-offset-4 hover:text-accent"
          >
            View on photobookers →
          </Link>
        </div>
      </div>
    </aside>
  );
};

const ContributorsAndShare = ({
  placements,
}: {
  placements: MagazineIssuePlacement[];
}) => (
  <section
    id="artists"
    class="scroll-mt-24 flex flex-col gap-6 border-t border-outline pt-8"
  >
    <SectionTitle className="mb-0 mt-0" kicker="The artists">
      The photographers in this issue
    </SectionTitle>
    <p class={proseClass}>
      Every book in this issue belongs to a photographer on photobookers.
      Verified artists have claimed their profiles; the rest have an open
      invitation waiting — being featured here is the reason to accept it.
    </p>

    <ul class="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {placements.map((placement) => {
        const artist = placement.book?.artist;
        const verified = artist?.status === "verified";
        return (
          <li class="flex flex-col gap-0.5 border border-outline bg-surface-alt/50 p-3">
            <span class="font-display text-base font-medium text-on-surface-strong">
              {artist?.displayName ?? "—"}
            </span>
            <span
              class={clsx(
                "text-[0.6rem] font-semibold uppercase tracking-wider",
                verified ? "text-[#4f7a4a]" : "text-on-surface-weak",
              )}
            >
              {verified ? "✦ Verified" : "Invited"}
            </span>
          </li>
        );
      })}
    </ul>

    <div
      class="flex flex-col gap-3 border border-on-surface-strong bg-surface-alt p-6"
      x-data="{ copied: false }"
    >
      <span class="kicker text-accent">Featured? Take it with you.</span>
      <h3 class="font-display text-xl font-medium text-on-surface-strong">
        Share the issue — or your page in it
      </h3>
      <p class="text-sm text-on-surface text-pretty">
        Every featured artist gets a direct link to their book and a ready-made
        share card. One tap, no design work. This is how an issue travels.
      </p>
      <div class="flex flex-wrap items-center gap-3 pt-1">
        <button
          type="button"
          class="border border-on-surface-strong px-4 py-2 text-sm font-semibold text-on-surface-strong transition-colors hover:border-accent hover:text-accent"
          x-on:click="navigator.clipboard?.writeText(window.location.href); copied = true; setTimeout(() => copied = false, 1800)"
        >
          Copy issue link
        </button>
        <span x-show="copied" x-cloak class="text-sm font-medium text-[#4f7a4a]">
          Link copied ✦
        </span>
      </div>
    </div>
  </section>
);

export default MagazineIssuePage;
