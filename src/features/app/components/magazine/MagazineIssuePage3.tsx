import clsx from "clsx";
import PageHeader from "@/components/app/PageHeader";
import SectionTitle from "@/components/app/SectionTitle";
import Link from "@/components/app/Link";
import VerifiedCreator from "@/components/app/VerifiedCreator";
import type {
  MagazineIssuePlacement,
  MagazineIssueView,
} from "@/domain/magazine/queries";
import Button from "@/components/app/Button";

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

const MagazineIssuePage3 = ({ issue }: Props) => {
  const placements = issue.placements.filter((p) => p.book);
  const bookCount = placements.length;

  return (
    <div class="mx-auto flex w-full max-w-2xl flex-col gap-10">
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

      {issue.editorsLetter.length > 0 ? (
        <section
          id="editors-letter"
          class="scroll-mt-24 flex max-w-xl flex-col gap-4 border-t border-outline pt-8"
        >
          <SectionTitle className="mb-0 mt-0">Editor's letter</SectionTitle>
          {issue.editorsLetter.map((paragraph) => (
            <p class={proseClass}>{paragraph}</p>
          ))}
          <p class="font-display text-lg italic text-on-surface-weak">
            — Eanna de Fréine, Photobookers Editor
          </p>
        </section>
      ) : null}

      <ShareButton />

      {placements.length > 0 ? (
        <section class="flex flex-col gap-12 border-t border-outline pt-10">
          {placements.map((placement) => (
            <BookEntry key={placement.bookId} placement={placement} />
          ))}
        </section>
      ) : null}

      <Contributors placements={placements} />
    </div>
  );
};

/** One book, single column: carousel on top, info beneath. */
const BookEntry = ({ placement }: { placement: MagazineIssuePlacement }) => {
  const { book, number } = placement;
  const title = book?.title ?? "Untitled";
  const artist = book?.artist;
  const href = book ? `/books/${book.slug}` : "#";
  const anchorId = book ? `book-${book.slug}` : `book-${number}`;
  const images = bookImages(book);

  return (
    <article id={anchorId} class="scroll-mt-24 flex flex-col gap-5">
      <BookCarousel images={images} />

      <div class="flex flex-col gap-3">
        <div class="flex items-center gap-2">
          <span class="h-px w-6 bg-accent" />
          <a
            href={`#${anchorId}`}
            class="kicker text-accent no-underline hover:underline"
          >
            Book {number}
          </a>
        </div>

        <h3 class="font-display text-2xl font-medium text-on-surface-strong text-balance">
          <Link href={href} className="hover:text-accent no-underline">
            {title}
          </Link>
        </h3>

        <div class="flex flex-wrap items-center gap-2">
          <Link
            href={`/creators/${artist?.slug}`}
            className="text-sm font-semibold text-on-surface-strong hover:text-accent no-underline"
          >
            {artist?.displayName}
          </Link>
        </div>

        {placement.blurb ? (
          <p class="text-base leading-relaxed text-on-surface text-pretty">
            {placement.blurb}
          </p>
        ) : null}

        {placement.artistPrompt && placement.artistQuote ? (
          <blockquote class="border-l-2 border-accent pl-4 text-sm italic leading-relaxed text-on-surface">
            <div class="not-italic font-semibold text-on-surface-strong">
              {`Question: ${placement.artistPrompt}`}
            </div>
            <div class="not-italic font-semibold text-accent">
              {`Answer: ${placement.artistQuote}`}
            </div>
          </blockquote>
        ) : null}

        <Link
          href={href}
          className="text-sm font-medium text-on-surface-strong underline decoration-accent underline-offset-4 hover:text-accent"
        >
          <Button variant="outline" color="primary" size="sm" width="fit">
            View on photobookers →
          </Button>
        </Link>
      </div>
    </article>
  );
};

/** Inline slider built on the shared `carouselForm` Alpine data. */
const BookCarousel = ({ images }: { images: string[] }) => {
  if (images.length === 0) {
    return (
      <div class="flex aspect-4/3 w-full items-center justify-center border border-outline bg-surface text-xs text-on-surface-weak">
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
        class="relative aspect-4/3 w-full"
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

type IssueArtist = {
  artist: NonNullable<NonNullable<MagazineIssuePlacement["book"]>["artist"]>;
  bookCount: number;
};

/** One entry per photographer, de-duped across books, order of first appearance. */
const issueArtists = (placements: MagazineIssuePlacement[]): IssueArtist[] => {
  const byId = new Map<string, IssueArtist>();
  for (const placement of placements) {
    const artist = placement.book?.artist;
    if (!artist) continue;
    const existing = byId.get(artist.id);
    if (existing) {
      existing.bookCount += 1;
    } else {
      byId.set(artist.id, { artist, bookCount: 1 });
    }
  }
  return Array.from(byId.values());
};

const Contributors = ({
  placements,
}: {
  placements: MagazineIssuePlacement[];
}) => {
  const artists = issueArtists(placements);

  return (
    <section
      id="artists"
      class="scroll-mt-24 flex flex-col gap-6 border-t border-outline pt-8"
    >
      <SectionTitle className="mb-0 mt-0" kicker="The artists">
        The photographers in this issue
      </SectionTitle>

      <ul class="grid grid-cols-1 gap-px overflow-hidden border border-outline bg-outline sm:grid-cols-2">
        {artists.map(({ artist, bookCount }) => {
          const verified = artist.status === "verified";
          const location = [artist.city, artist.country]
            .filter(Boolean)
            .join(", ");
          return (
            <li>
              <a
                href={`/creators/${artist.slug}`}
                class="group flex items-center gap-4 bg-surface p-4 transition-colors hover:bg-surface-alt"
              >
                <div class="relative size-14 shrink-0 overflow-hidden border border-outline bg-surface-alt">
                  {artist.coverUrl ? (
                    <img
                      src={artist.coverUrl}
                      alt={artist.displayName ?? ""}
                      loading="lazy"
                      class="size-full object-cover"
                    />
                  ) : null}
                </div>

                <div class="flex min-w-0 flex-col gap-0.5">
                  <span class="flex items-center gap-1.5">
                    <span class="truncate font-display text-base font-medium text-on-surface-strong group-hover:text-accent">
                      {artist.displayName ?? "—"}
                    </span>
                    {verified ? (
                      <VerifiedCreator creatorStatus="verified" size="xs" />
                    ) : null}
                  </span>

                  <span class="truncate text-sm text-on-surface-weak">
                    {location ||
                      (bookCount > 1
                        ? `${bookCount} books`
                        : "Featured artist")}
                  </span>
                </div>

                <span
                  aria-hidden="true"
                  class="ml-auto shrink-0 text-on-surface-weak transition-colors group-hover:text-accent"
                >
                  {arrowRightIcon}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

const ShareButton = () => (
  <div x-data="{ copied: false }" class="pt-2">
    <button
      type="button"
      x-on:click="
            const url = window.location.href;
            if (navigator.share) { navigator.share({ url }).catch(() => {}); }
            else { navigator.clipboard?.writeText(url); copied = true; setTimeout(() => copied = false, 1800); }
          "
    >
      {shareIcon}
      <span x-text="copied ? 'Link copied ✦' : 'Share this issue'">
        Share this issue
      </span>
    </button>
  </div>
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

const shareIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    stroke="currentColor"
    fill="none"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="size-4"
    aria-hidden="true"
  >
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
  </svg>
);

export default MagazineIssuePage3;
