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
  getArtistOfTheWeekForDateQuery,
  getPublisherOfTheWeekForDateQuery,
  PublisherOfTheWeekWithCreator,
} from "../../features/dashboard/admin/planner/services";
import { formatDate, getRandomCoverUrl } from "../../utils";
import Button from "./Button";
import { getCoverUrlsForHeroCarousel } from "../../features/app/services";
import { leftArrowIcon, rightArrowIcon } from "../../lib/icons";

export type { HeroCarouselItem };

function toAlpineDataJson(items: HeroCarouselItem[]) {
  return JSON.stringify(items).replace(/</g, "\\u003c");
}

type ArtistOfTheWeekData = Extract<
  Awaited<ReturnType<typeof getArtistOfTheWeekForDateQuery>>,
  [null, unknown]
>[1];

type PublisherOfTheWeekData = Extract<
  Awaited<ReturnType<typeof getPublisherOfTheWeekForDateQuery>>,
  [null, unknown]
>[1];

const HeroCarousel = async () => {
  const [bookRes, artistRes, publisherRes] = await Promise.all([
    getThisWeeksBookOfTheWeek(),
    getThisWeeksArtistOfTheWeek(),
    getThisWeeksPublisherOfTheWeek(),
  ]);

  const [bookErr, bookOfTheWeek] = bookRes;
  const [artistErr, artistOfTheWeek] = artistRes;
  const [publisherErr, publisherOfTheWeek] = publisherRes;

  const [publisherCoverStackErr, publisherCoverStack] =
    !publisherErr && publisherOfTheWeek?.creator?.id
      ? await getCoverUrlsForHeroCarousel(
          "publisher",
          publisherOfTheWeek.creator.id,
        )
      : [];

  const [artistCoverStackErr, artistCoverStack] =
    !artistErr && artistOfTheWeek?.creator?.id
      ? await getCoverUrlsForHeroCarousel("artist", artistOfTheWeek.creator.id)
      : [];

  const heroItems = buildHeroCarouselItems(
    bookErr ? null : bookOfTheWeek,
    artistErr ? null : artistOfTheWeek,
    publisherErr ? null : publisherOfTheWeek,
    publisherCoverStack,
    artistCoverStack,
  );

  return (
    <div
      x-data={`heroCarousel(${toAlpineDataJson(heroItems)})`}
      x-init="init()"
      x-on:mouseenter="pause()"
      x-on:mouseleave="resume()"
    >
      <div class="flex gap-6 px-8 py-4 text-sm">
        <template x-for="(item, index) in items">
          <button
            x-on:click="go(index)"
            x-bind:class="active === index ? 'text-black border-b-2 border-black' : 'text-gray-400'"
            class="pb-1 transition cursor-pointer"
            x-text="item.label"
          ></button>
        </template>
      </div>

      <section
        class="py-8 rounded-md shadow-md"
        x-bind:class="items[active] ? items[active].slideClass : ''"
      >
        {/* <!-- Slides --> */}
        <div class="relative h-[420px] flex items-center px-8">
          <template x-for="(item, index) in items">
            <div
              x-show="active === index"
              x-transition:enter="transition ease-out duration-500"
              x-transition:enter-start="opacity-0 translate-x-6"
              x-transition:enter-end="opacity-100 translate-x-0"
              class="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-10 w-full items-center"
            >
              {/* <!-- LEFT: Visual --> */}
              <div class="relative flex justify-center items-center min-h-[380px] w-full mx-auto ">
                <template x-if="item.coverStack && item.coverStack.length > 1">
                  <div class="grid grid-cols-4 gap-3 w-full max-w-[700px] min-w-[260px] shrink-0">
                    <template x-for="(url, i) in item.coverStack">
                      <img
                        x-bind:src="url"
                        class="w-full aspect-3/4 rounded-md shadow-md object-cover"
                      />
                    </template>
                  </div>
                </template>
                <template x-if="!item.coverStack || item.coverStack.length <= 1">
                  <img
                    x-bind:src="item.image"
                    class="max-h-[340px] shadow-xl rounded-lg transition duration-500 hover:scale-105"
                  />
                </template>
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
          class="absolute left-12 top-1/2 -translate-y-1/2"
        >
          {leftArrowIcon}
        </button>

        <button
          x-show="items.length > 1"
          x-on:click="next()"
          class="absolute right-12 top-1/2 -translate-y-1/2"
        >
          {rightArrowIcon}
        </button>
      </section>
    </div>
  );
};

export default HeroCarousel;

function buildHeroCarouselItems(
  bookOfTheWeek: BookOfTheWeekWithBook | null,
  artistOfTheWeek: ArtistOfTheWeekData | null,
  publisherOfTheWeek: PublisherOfTheWeekData | null,
  publisherCoverStack: string[],
  artistCoverStack: string[],
): HeroCarouselItem[] {
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
      creator: book.artist ? `by ${book.artist.displayName}` : "",
      image: imageUrls[0] ?? getRandomCoverUrl(),
      ...(imageUrls[1] ? { stack: imageUrls[1] } : {}),
      link: `/books/${book.slug}`,
      slideClass: "bg-amber-100",
    });
  }

  const artist = artistOfTheWeek?.creator ?? null;

  if (artist) {
    const stack =
      artistCoverStack.length >= 2
        ? artistCoverStack
        : artistCoverStack.length === 1
          ? artistCoverStack
          : [];

    items.push({
      label: "Artist of the Week",
      title: artist.displayName,
      creator: `by ${artist.displayName}`,
      ...(stack.length > 1 ? { coverStack: stack } : {}),
      link: `/creators/${artist.slug}`,
      slideClass: "bg-blue-100",
    });
  }

  const publisher = publisherOfTheWeek?.creator;

  if (publisher) {
    const stack =
      publisherCoverStack.length >= 2
        ? publisherCoverStack
        : publisherCoverStack.length === 1
          ? publisherCoverStack
          : [];

    items.push({
      label: "Publisher of the Week",
      title: publisher.displayName,
      creator: publisherOfTheWeek.text?.trim() || "Featured publisher",
      ...(stack.length > 1 ? { coverStack: stack } : {}),
      link: `/creators/${publisher.slug}`,
      slideClass: "bg-red-100",
    });
  }

  return items;
}
