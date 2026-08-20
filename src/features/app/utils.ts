import type { CreatorOfTheWeekSpotlightData } from "./components/CreatorOfTheWeekSpotlight";
import { formatCountry } from "../../lib/utils";
import {
  getArtistOfTheWeekForDateQuery,
  getPublisherOfTheWeekForDateQuery,
} from "../dashboard/admin/planner/services";
import {
  BookOfTheDayWithBook,
  getBookOfTheDayForDate,
  getTodaysBookOfTheDay,
} from "./BOTDServices";
import {
  getThisWeeksArtistOfTheWeek,
  getThisWeeksPublisherOfTheWeek,
} from "./CreatorSpotlightServices";
import { getCoverUrlsForHeroCarousel } from "./services";
import { aotwPath, potwPath } from "./spotlightUrls";

export type ArtistOfTheWeekData = Extract<
  Awaited<ReturnType<typeof getArtistOfTheWeekForDateQuery>>,
  [null, unknown]
>[1];

export type PublisherOfTheWeekData = Extract<
  Awaited<ReturnType<typeof getPublisherOfTheWeekForDateQuery>>,
  [null, unknown]
>[1];

async function heroCarouselCoverStack(
  role: "publisher" | "artist",
  creatorId: string | null,
): Promise<string[]> {
  if (!creatorId) return [];
  const [coverErr, urls] = await getCoverUrlsForHeroCarousel(role, creatorId);
  return !coverErr && urls ? urls : [];
}
/** Fetches catalogue cover URLs for hero slides (parallel). */
export async function loadHeroCarouselCoverStacks(params: {
  publisherCreatorId: string | null;
  artistCreatorId: string | null;
}) {
  const [publisherCoverStack, artistCoverStack] = await Promise.all([
    heroCarouselCoverStack("publisher", params.publisherCreatorId),
    heroCarouselCoverStack("artist", params.artistCreatorId),
  ]);
  return { publisherCoverStack, artistCoverStack };
}

/**
 * A weekly spotlight, shaped for its own block on /featured. Returns null when
 * there is no pick this week so the caller can drop the column.
 */
export function buildCreatorOfTheWeekSpotlight(
  role: "artist",
  data: ArtistOfTheWeekData | null,
  coverStack: string[],
): CreatorOfTheWeekSpotlightData | null;
export function buildCreatorOfTheWeekSpotlight(
  role: "publisher",
  data: PublisherOfTheWeekData | null,
  coverStack: string[],
): CreatorOfTheWeekSpotlightData | null;
export function buildCreatorOfTheWeekSpotlight(
  role: "artist" | "publisher",
  data: ArtistOfTheWeekData | PublisherOfTheWeekData | null,
  coverStack: string[],
): CreatorOfTheWeekSpotlightData | null {
  const creator = data?.creator;
  if (!data || !creator) return null;

  return {
    role,
    creator: {
      id: creator.id,
      displayName: creator.displayName,
      slug: creator.slug,
      coverUrl: creator.coverUrl ?? null,
      country: creator.country ?? null,
    },
    featuredImageUrl: data.featuredImageUrl ?? null,
    coverStack,
    link:
      role === "artist" ? aotwPath(data.weekStart) : potwPath(data.weekStart),
  };
}

/** This week's artist and publisher picks, with a few covers each. */
export async function loadCreatorsOfTheWeek(): Promise<{
  artist: CreatorOfTheWeekSpotlightData | null;
  publisher: CreatorOfTheWeekSpotlightData | null;
}> {
  const [[artistErr, artistOfTheWeek], [publisherErr, publisherOfTheWeek]] =
    await Promise.all([
      getThisWeeksArtistOfTheWeek(),
      getThisWeeksPublisherOfTheWeek(),
    ]);

  const artist = artistErr ? null : artistOfTheWeek;
  const publisher = publisherErr ? null : publisherOfTheWeek;

  const { publisherCoverStack, artistCoverStack } =
    await loadHeroCarouselCoverStacks({
      publisherCreatorId: publisher ? publisher.creatorId : null,
      artistCreatorId: artist ? artist.creatorId : null,
    });

  return {
    artist: buildCreatorOfTheWeekSpotlight("artist", artist, artistCoverStack),
    publisher: buildCreatorOfTheWeekSpotlight(
      "publisher",
      publisher,
      publisherCoverStack,
    ),
  };
}

/** Today's pick plus yesterday's, for the Book of the Day block. */
export async function loadBookOfTheDayFeature(): Promise<{
  today: BookOfTheDayWithBook | null;
  yesterday: BookOfTheDayWithBook | null;
  twoDaysAgo: BookOfTheDayWithBook | null;
  threeDaysAgo: BookOfTheDayWithBook | null;
}> {
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);

  const twoDaysAgoDate = new Date();
  twoDaysAgoDate.setDate(twoDaysAgoDate.getDate() - 2);

  const threeDaysAgoDate = new Date();
  threeDaysAgoDate.setDate(threeDaysAgoDate.getDate() - 3);

  const [[todayErr, today], [, yesterday], [, twoDaysAgo], [, threeDaysAgo]] =
    await Promise.all([
      getTodaysBookOfTheDay(),
      getBookOfTheDayForDate(yesterdayDate),
      getBookOfTheDayForDate(twoDaysAgoDate),
      getBookOfTheDayForDate(threeDaysAgoDate),
    ]);

  return {
    today: todayErr || !today?.book ? null : today,
    yesterday: yesterday?.book ? yesterday : null,
    twoDaysAgo: twoDaysAgo?.book ? twoDaysAgo : null,
    threeDaysAgo: threeDaysAgo?.book ? threeDaysAgo : null,
  };
}

export function getImageSizeClass(size: number) {
  const imageSizeClass =
    {
      12: "size-12",
      14: "size-14",
      16: "size-16",
      20: "size-20",
      24: "size-24",
      28: "size-28",
      32: "size-32",
    }[size] ?? "size-24";
  return imageSizeClass;
}
