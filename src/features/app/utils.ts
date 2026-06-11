import { HeroCarouselItem } from "../../client/components/heroCarousel";
import { formatCountry, toDateString } from "../../lib/utils";
import {
  getArtistOfTheWeekForDateQuery,
  getPublisherOfTheWeekForDateQuery,
} from "../dashboard/admin/planner/services";
import { getWeekNumber } from "../dashboard/admin/planner/utils";
import { BookOfTheDayWithBook } from "./BOTDServices";
import { getCoverUrlsForHeroCarousel } from "./services";
import { aotwPath, botdPath, potwPath } from "./spotlightUrls";

type ArtistOfTheWeekData = Extract<
  Awaited<ReturnType<typeof getArtistOfTheWeekForDateQuery>>,
  [null, unknown]
>[1];

type PublisherOfTheWeekData = Extract<
  Awaited<ReturnType<typeof getPublisherOfTheWeekForDateQuery>>,
  [null, unknown]
>[1];

export type { HeroCarouselItem };

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

export function buildHeroCarouselItems(
  bookOfTheDay: BookOfTheDayWithBook | null,
  artistOfTheWeek: ArtistOfTheWeekData | null,
  publisherOfTheWeek: PublisherOfTheWeekData | null,
  publisherCoverStack: string[],
  artistCoverStack: string[],
): HeroCarouselItem[] {
  const weekNumber = bookOfTheDay ? getWeekNumber(bookOfTheDay.date) : null;
  const items: HeroCarouselItem[] = [];

  const book = bookOfTheDay?.book;
  if (book) {
    const imageUrls = [
      book.coverUrl,
      ...(book.images?.map((img) => img.imageUrl) ?? []),
    ].filter((url): url is string => Boolean(url));

    items.push({
      label: "Book of the Day",
      title: book.title,
      text: book.artist ? `by ${book.artist.displayName}` : "",
      image: imageUrls[0],
      link: botdPath(bookOfTheDay.date),
      slideClass: "bg-[#f2efe8]",
      weekNumber,
      dateLabel: toDateString(bookOfTheDay.date),
    });
  }

  const artist = artistOfTheWeek?.creator;

  if (artist) {
    const stack = artistCoverStack.length >= 2 ? artistCoverStack : [];
    items.push({
      label: "Artist of the Week",
      title: artist.displayName,
      image: artist.coverUrl ?? undefined,
      coverStack: stack,
      text: artist.country?.trim()
        ? `Based in ${formatCountry(artist.country.trim())}`
        : "Discover this week's featured artist.",
      link: aotwPath(artistOfTheWeek.weekStart),
      slideClass: "bg-[#e8e9e2]",
      weekNumber,
    });
  }

  const publisher = publisherOfTheWeek?.creator;

  if (publisher) {
    const stack = publisherCoverStack.length >= 2 ? publisherCoverStack : [];

    items.push({
      label: "Publisher of the Week",
      title: publisher.displayName,
      image: stack[0],
      coverStack: stack,
      link: potwPath(publisherOfTheWeek.weekStart),
      text: publisher.country?.trim()
        ? `Based in ${formatCountry(publisher.country.trim())}`
        : "Discover this week's featured publisher.",
      slideClass: "bg-[#efe5e0]",
      weekNumber,
    });
  }

  return items;
}

export function toAlpineDataJson(items: HeroCarouselItem[]) {
  return JSON.stringify(items).replace(/</g, "\\u003c");
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
