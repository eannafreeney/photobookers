import { log } from "console";
import type { HeroCarouselItem } from "../../client/components/heroCarousel";
import {
  BookOfTheWeekWithBook,
  getThisWeeksBookOfTheWeek,
} from "../../features/app/BOTWServices";
import {
  getThisWeeksArtistOfTheWeek,
  getThisWeeksPublisherOfTheWeek,
} from "../../features/app/CreatorSpotlightServices";
import {
  ArtistOfTheWeekWithCreator,
  PublisherOfTheWeekWithCreator,
} from "../../features/dashboard/admin/planner/services";
import { isErr } from "../../lib/result";
import { formatDate, getRandomCoverUrl } from "../../utils";
import Button from "./Button";

export type { HeroCarouselItem };

function toAlpineDataJson(items: HeroCarouselItem[]) {
  return JSON.stringify(items).replace(/</g, "\\u003c");
}

const HeroCarousel = async () => {
  const [bookRes, artistRes, publisherRes] = await Promise.all([
    getThisWeeksBookOfTheWeek(),
    getThisWeeksArtistOfTheWeek(),
    getThisWeeksPublisherOfTheWeek(),
  ]);

  const [bookErr, bookOfTheWeek] = bookRes;
  const [artistErr, artistOfTheWeek] = artistRes;
  const [publisherErr, publisherOfTheWeek] = publisherRes;

  const heroItems = buildHeroCarouselItems(
    bookErr ? null : bookOfTheWeek,
    artistErr ? null : artistOfTheWeek,
    publisherErr ? null : publisherOfTheWeek,
  );

  if (heroItems.length === 0) return <></>;

  console.log(heroItems);

  return (
    <div
      x-data={`heroCarousel(${toAlpineDataJson(heroItems)})`}
      x-init="init()"
      class="relative w-full bg-neutral-100 rounded-2xl overflow-hidden"
    >
      {/* <!-- Tabs --> */}
      <div class="flex gap-6 px-8 pt-6 text-sm">
        <template x-for="(item, index) in items">
          <button
            x-on:click="go(index)"
            x-bind:class="active === index ? 'text-black border-b-2 border-black' : 'text-gray-400'"
            class="pb-2 transition"
            x-text="item.label"
          ></button>
        </template>
      </div>

      {/* <!-- Slides --> */}
      <div class="relative h-[420px] flex items-center px-8 pb-8">
        <template x-for="(item, index) in items">
          <div
            x-show="active === index"
            x-transition:enter="transition ease-out duration-500"
            x-transition:enter-start="opacity-0 translate-x-6"
            x-transition:enter-end="opacity-100 translate-x-0"
            class="grid grid-cols-2 gap-10 w-full items-center"
          >
            {/* <!-- LEFT: Visual --> */}
            <div class="relative flex justify-center items-center">
              {/* <!-- Main image --> */}
              <img
                x-bind:src="item.image"
                class="max-h-[340px] shadow-xl rounded-lg transition duration-500 hover:scale-105"
              />
            </div>

            {/* <!-- RIGHT: Content --> */}
            <div class="max-w-md flex flex-col gap-2">
              <p class="text-sm text-gray-500 mb-2" x-text="item.label"></p>
              <div>
                <h2 class="text-3xl font-semibold" x-text="item.title"></h2>
                <p class="text-gray-600 mb-2" x-text="item.creator"></p>
              </div>
              <a x-bind:href="item.link">
                <Button
                  variant="solid"
                  color="primary"
                  width="fit"
                  x-bind:href="item.link"
                >
                  View →
                </Button>
              </a>
            </div>
          </div>
        </template>
      </div>

      {/* <!-- Arrows --> */}
      <button
        x-show="items.length > 1"
        x-on:click="prev()"
        class="absolute left-4 top-1/2 -translate-y-1/2"
      >
        ←
      </button>

      <button
        x-show="items.length > 1"
        x-on:click="next()"
        class="absolute right-4 top-1/2 -translate-y-1/2"
      >
        →
      </button>
    </div>
  );
};

export default HeroCarousel;

function buildHeroCarouselItems(
  bookOfTheWeek: BookOfTheWeekWithBook | null,
  artistOfTheWeek: ArtistOfTheWeekWithCreator | null,
  publisherOfTheWeek: PublisherOfTheWeekWithCreator | null,
): HeroCarouselItem[] {
  const items: HeroCarouselItem[] = [];

  const book = bookOfTheWeek?.book;
  if (book) {
    const imageUrls = [
      book.coverUrl,
      ...(book.images?.map((img) => img.imageUrl) ?? []),
    ].filter((url): url is string => Boolean(url));

    const release =
      book.releaseDate != null
        ? formatDate(
            book.releaseDate instanceof Date
              ? book.releaseDate
              : new Date(book.releaseDate),
          )
        : null;

    const metaFromBook = [book.publisher?.displayName, release]
      .filter(Boolean)
      .join(" · ");

    items.push({
      label: "Book of the Week",
      title: book.title,
      creator: book.artist ? `by ${book.artist.displayName}` : null,
      image: imageUrls[0] ?? getRandomCoverUrl(),
      ...(imageUrls[1] ? { stack: imageUrls[1] } : {}),
      link: `/books/${book.slug}`,
    });
  }

  const artist = artistOfTheWeek?.creator ?? null;
  items.push({
    label: "Artist of the Week",
    title: artist.displayName,
    creator: artist ? `by ${artist.displayName}` : null,
    image: artist.coverUrl ?? getRandomCoverUrl(),
    link: `/creators/${artist.slug}`,
  });

  const publisher = publisherOfTheWeek?.creator;
  if (publisher) {
    items.push({
      label: "Publisher of the Week",
      title: publisher.displayName,
      creator: publisher ? `by ${publisher.displayName}` : null,
      image: publisher.coverUrl ?? getRandomCoverUrl(),
      link: `/creators/${publisher.slug}`,
    });
  }

  return items;
}
