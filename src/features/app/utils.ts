import { HeroCarouselItem } from "../../client/components/heroCarousel";
import {
  getArtistOfTheWeekForDateQuery,
  getPublisherOfTheWeekForDateQuery,
} from "../dashboard/admin/planner/services";
import { getWeekNumber } from "../dashboard/admin/planner/utils";
import { BookOfTheWeekWithBook } from "./BOTWServices";
import { getCoverUrlsForHeroCarousel } from "./services";

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
  bookOfTheWeek: BookOfTheWeekWithBook | null,
  artistOfTheWeek: ArtistOfTheWeekData | null,
  publisherOfTheWeek: PublisherOfTheWeekData | null,
  publisherCoverStack: string[],
  artistCoverStack: string[],
): HeroCarouselItem[] {
  const weekNumber = bookOfTheWeek
    ? getWeekNumber(bookOfTheWeek.weekStart)
    : null;
  const items: HeroCarouselItem[] = [];

  const book = bookOfTheWeek?.book;
  if (book) {
    const imageUrls = [
      book.coverUrl,
      ...(book.images?.map((img) => img.imageUrl) ?? []),
    ].filter((url): url is string => Boolean(url));

    items.push({
      label: "Book of the Week",
      title: book.title,
      text: book.artist ? `by ${book.artist.displayName}` : "",
      image: imageUrls[0],
      link: `/books/${book.slug}`,
      slideClass: "bg-amber-100",
      weekNumber,
    });
  }

  const artist = artistOfTheWeek?.creator ?? null;

  if (artist) {
    const stack = artistCoverStack.length >= 2 ? artistCoverStack : [];
    items.push({
      label: "Artist of the Week",
      title: artist.displayName,
      image: artist.coverUrl ?? undefined,
      coverStack: stack,
      text: artist.tagline ?? "",
      link: `/creators/${artist.slug}`,
      slideClass: "bg-sky-100",
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
      link: `/creators/${publisher.slug}`,
      text: "",
      slideClass: "bg-red-100",
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
