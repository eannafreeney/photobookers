import type { AuthUser } from "../../../../types";
import { formatCountry } from "../../../lib/utils";
import FollowButton from "../../api/components/FollowButton";
import SectionHeader from "../../../components/app/SectionHeader";

export type CreatorOfTheWeekSpotlightData = {
  role: "artist" | "publisher";
  creator: {
    id: string;
    displayName: string;
    slug: string;
    coverUrl: string | null;
    country: string | null;
  };
  featuredImageUrl: string | null;
  /** Covers from their catalogue — the highest-resolution art we hold. */
  coverStack: string[];
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
          <a
            href={link}
            class="flex items-end gap-3"
            aria-label={`Books from ${creator.displayName}`}
          >
            {covers.map((cover) => (
              <img
                key={cover}
                src={cover}
                alt=""
                class="h-20 w-auto object-contain sm:h-24"
                loading="lazy"
                decoding="async"
              />
            ))}
          </a>
        ) : null}
      </div>
    </section>
  );
};

export default CreatorOfTheWeekSpotlight;
