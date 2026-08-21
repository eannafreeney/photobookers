import type { AuthUser } from "../../../../types";
import { formatCountry } from "../../../lib/utils";
import FollowButton from "../../api/components/FollowButton";
import SectionHeader from "../../../components/app/SectionHeader";
import { bookPath } from "../spotlightUrls";

/** One catalogue cover, carrying enough to link and label itself. */
export type SpotlightCatalogueBook = {
  title: string;
  slug: string;
  coverUrl: string;
};

export type CreatorOfTheWeekSpotlightData = {
  role: "artist" | "publisher";
  creator: {
    id: string;
    displayName: string;
    slug: string;
    coverUrl: string | null;
    country: string | null;
    tagline: string | null;
  };
  featuredImageUrl: string | null;
  /** Books from their catalogue — the highest-resolution art we hold. */
  coverStack: SpotlightCatalogueBook[];
  /** AI-written weekly blurb from the planner; falls back to the tagline. */
  spotlightBlurb: string | null;
  link: string;
};

type Props = {
  spotlight: CreatorOfTheWeekSpotlightData;
  user: AuthUser | null;
};

const LABEL = {
  artist: "Artist of the Week",
  publisher: "Publisher of the Week",
} as const;

/**
 * Creator images are square and only 600–800px, so they get a square sized to
 * what the source can actually carry (crisp at 2x) rather than a stretched
 * banner. Covers are a bonus, not the structure: publishers have dozens,
 * artists usually one or two and sometimes none — so the portrait grows to
 * fill the block when there is no catalogue to show.
 */
const PORTRAIT_PX = 288;

const CreatorOfTheWeekSpotlight = ({ spotlight, user }: Props) => {
  const { creator, role, link } = spotlight;
  const portrait = spotlight.featuredImageUrl ?? creator.coverUrl ?? "";
  const covers = spotlight.coverStack.slice(0, 4);
  const blurb = spotlight.spotlightBlurb?.trim() || creator.tagline?.trim();
  const portraitClass = covers.length
    ? "size-32 sm:size-44 md:size-56"
    : "size-40 sm:size-56 md:size-72";

  return (
    <section class="flex flex-col" aria-label={LABEL[role]}>
      <SectionHeader kicker={LABEL[role]} />

      <div class="flex flex-col gap-5">
        <div class="flex items-start gap-5">
          {portrait ? (
            <a href={link} class="shrink-0">
              <img
                src={portrait}
                alt={creator.displayName}
                width={PORTRAIT_PX}
                height={PORTRAIT_PX}
                class={`${portraitClass} object-cover`}
                loading="lazy"
                decoding="async"
              />
            </a>
          ) : null}

          <div class="flex min-w-0 flex-1 flex-col gap-2">
            <h3 class="font-display text-2xl font-medium leading-tight text-on-surface-strong text-balance">
              <a href={link}>{creator.displayName}</a>
            </h3>
            {creator.country?.trim() ? (
              <p class="text-sm text-on-surface-weak">
                Based in {formatCountry(creator.country.trim())}
              </p>
            ) : null}

            {blurb ? (
              <p class="text-pretty text-sm leading-relaxed text-on-surface line-clamp-5">
                {blurb}
              </p>
            ) : null}

            <div class="mt-1 flex flex-wrap items-center gap-3">
              <div class="w-32">
                <FollowButton creator={creator} user={user} variant="hero" />
              </div>
              <a
                href={link}
                class="kicker group inline-flex items-center text-on-surface-weak transition-colors hover:text-on-surface-strong"
              >
                View feature
                <span class="w-0 overflow-hidden opacity-0 transition-all duration-300 ease-in-out group-hover:w-4 group-hover:opacity-100">
                  &nbsp;→
                </span>
              </a>
            </div>
          </div>
        </div>

        {covers.length > 0 ? (
          <ul
            class="flex items-end gap-3"
            aria-label={`Books from ${creator.displayName}`}
          >
            {covers.map((book) => (
              <li key={book.slug} class="list-none">
                <a
                  href={bookPath(book.slug)}
                  title={book.title}
                  class="group/cover flex flex-col gap-1"
                >
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    class="h-20 w-auto object-contain object-bottom sm:h-24"
                    loading="lazy"
                    decoding="async"
                  />
                  {/* Reserved slot, so revealing the title shifts nothing. */}
                  <span class="line-clamp-2 h-8 max-w-28 text-[11px] leading-4 text-on-surface-weak opacity-0 transition-opacity duration-200 group-hover/cover:opacity-100 group-focus-visible/cover:opacity-100">
                    {book.title}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
};

export default CreatorOfTheWeekSpotlight;
