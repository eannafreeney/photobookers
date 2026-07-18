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

/** Cover + gallery images for one book, de-duped, cover first. */
const bookImages = (book: MagazineIssuePlacement["book"]): string[] => {
  const raw = [
    book?.coverUrl,
    ...(book?.images?.map((image) => image.imageUrl) ?? []),
  ].filter(Boolean) as string[];
  return Array.from(new Set(raw));
};

const MagazineIssuePage2 = ({ issue }: Props) => {
  const placements = issue.placements.filter((p) => p.book);
  const bookCount = placements.length;
  const [featured, ...rest] = placements;

  return (
    <div class="mx-auto flex w-full max-w-5xl flex-col gap-12">
      {issue.bannerUrl ? (
        <figure class="-mt-2 flex flex-col gap-2">
          <img
            src={issue.bannerUrl}
            alt={`${issue.kicker ?? "Issue"}: ${issue.title}`}
            width={1600}
            height={560}
            class="h-56 w-full border border-outline object-cover md:h-96"
          />
        </figure>
      ) : null}

      {/* Masthead: header + meta on the left, editor's letter on the right */}
      <header class="grid grid-cols-1 gap-10 lg:grid-cols-[3fr_2fr]">
        <div class="flex flex-col gap-6">
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
        </div>

        {issue.editorsLetter.length > 0 ? (
          <section
            id="editors-letter"
            class="scroll-mt-24 flex flex-col gap-4 border-l-0 border-t border-outline pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0"
          >
            <span class="kicker text-accent">Editor's letter</span>
            {issue.editorsLetter.map((paragraph) => (
              <p class="text-base leading-relaxed text-on-surface text-pretty font-display">
                {paragraph}
              </p>
            ))}
            <p class="font-display text-base italic text-on-surface-weak">
              — The editors, Photobookers
            </p>
          </section>
        ) : null}
      </header>

      {placements.length > 0 ? (
        <section class="flex flex-col gap-10 border-t border-outline pt-10">
          <SectionTitle className="mb-0 mt-0" kicker="The selection">
            Books in this issue
          </SectionTitle>

          {/* Featured "cover story" — a wide, asymmetric spread */}
          {featured ? <FeaturedBookPlate placement={featured} /> : null}

          {/* Everything else — a two-up grid of vertical carousel cards */}
          {rest.length > 0 ? (
            <div class="grid grid-cols-1 items-start gap-8 sm:grid-cols-2">
              {rest.map((placement) => (
                <BookCard key={placement.bookId} placement={placement} />
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      <ContributorsAndShare placements={placements} />
    </div>
  );
};

/** Small inline slider built on the shared `carouselForm` Alpine data. */
const BookCarousel = ({
  images,
  ratio = "aspect-[4/5]",
}: {
  images: string[];
  ratio?: string;
}) => {
  if (images.length === 0) {
    return (
      <div
        class={clsx(
          "flex w-full items-center justify-center border border-outline bg-surface text-xs text-on-surface-weak",
          ratio,
        )}
      >
        No images
      </div>
    );
  }

  const multiple = images.length > 1;

  return (
    <div
      x-data={`carouselForm(${JSON.stringify(images)})`}
      class="group relative w-full overflow-hidden border border-outline bg-surface"
    >
      <div
        class={clsx("relative w-full", ratio)}
        x-on:touchstart="handleTouchStart($event)"
        x-on:touchmove="handleTouchMove($event)"
        x-on:touchend="handleTouchEnd()"
      >
        <div
          class="flex h-full transition-transform duration-300 ease-out"
          x-bind:style="`transform: translateX(-${(currentSlideIndex - 1) * 100}%)`"
        >
          <template x-for="slide in slides">
            <div class="h-full w-full shrink-0">
              <img
                class="h-full w-full object-cover"
                x-bind:src="slide.imgSrc"
                x-bind:alt="slide.imgAlt"
                loading="lazy"
              />
            </div>
          </template>
        </div>

        {multiple ? (
          <>
            <button
              type="button"
              aria-label="Previous image"
              x-on:click="previous()"
              class="absolute left-2 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center border border-outline bg-surface/80 text-on-surface-strong opacity-0 backdrop-blur-sm transition-opacity hover:border-accent hover:text-accent group-hover:opacity-100"
            >
              {arrowLeftIcon}
            </button>
            <button
              type="button"
              aria-label="Next image"
              x-on:click="next()"
              class="absolute right-2 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center border border-outline bg-surface/80 text-on-surface-strong opacity-0 backdrop-blur-sm transition-opacity hover:border-accent hover:text-accent group-hover:opacity-100"
            >
              {arrowRightIcon}
            </button>
            <div class="absolute bottom-2 left-0 right-0 z-10 flex justify-center gap-1.5">
              <template x-for="(slide, index) in slides">
                <button
                  type="button"
                  class="size-1.5 rounded-full transition"
                  x-on:click="currentSlideIndex = index + 1"
                  x-bind:class="currentSlideIndex === index + 1 ? 'bg-on-surface-strong w-4' : 'bg-on-surface/50'"
                  x-bind:aria-label="'Image ' + (index + 1)"
                ></button>
              </template>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

/** Title, artist/publisher, blurb and quote — shared by the featured + grid cards. */
const BookMeta = ({
  placement,
  align = "left",
}: {
  placement: MagazineIssuePlacement;
  align?: "left" | "right";
}) => {
  const { book, number } = placement;
  const title = book?.title ?? "Untitled";
  const artist = book?.artist;
  const isVerified = artist?.status === "verified";
  const href = book ? `/books/${book.slug}` : "#";
  const isRight = align === "right";

  return (
    <div
      class={clsx(
        "flex min-w-0 flex-col gap-3",
        isRight && "sm:items-end sm:text-right",
      )}
    >
      <div
        class={clsx(
          "flex items-center gap-2",
          isRight && "sm:flex-row-reverse",
        )}
      >
        <span class="h-px w-6 bg-accent" />
        <span class="kicker text-accent">Book {number}</span>
      </div>

      <h3 class="font-display text-2xl font-medium text-on-surface-strong text-balance">
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
  );
};

/** Wide, asymmetric opener: big carousel beside the write-up. */
const FeaturedBookPlate = ({
  placement,
}: {
  placement: MagazineIssuePlacement;
}) => {
  const images = bookImages(placement.book);
  return (
    <article class="grid grid-cols-1 items-center gap-6 border border-outline bg-surface-alt/50 p-5 md:grid-cols-[3fr_2fr] md:gap-8 md:p-8">
      <BookCarousel images={images} ratio="aspect-[4/3] md:aspect-[5/4]" />
      <BookMeta placement={placement} />
    </article>
  );
};

/** Vertical card: carousel on top, meta beneath. */
const BookCard = ({ placement }: { placement: MagazineIssuePlacement }) => {
  const images = bookImages(placement.book);
  return (
    <article class="flex h-full flex-col gap-4 border border-outline bg-surface-alt/50 p-5">
      <BookCarousel images={images} ratio="aspect-[4/5]" />
      <BookMeta placement={placement} />
    </article>
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

const arrowLeftIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    stroke="currentColor"
    fill="none"
    stroke-width="2.5"
    class="size-4"
    aria-hidden="true"
  >
    <path d="M15.75 19.5 8.25 12l7.5-7.5" />
  </svg>
);

const arrowRightIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    stroke="currentColor"
    fill="none"
    stroke-width="2.5"
    class="size-4"
    aria-hidden="true"
  >
    <path d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);

export default MagazineIssuePage2;
