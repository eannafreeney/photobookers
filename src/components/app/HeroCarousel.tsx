import { getThisWeeksBookOfTheWeek } from "../../features/app/BOTWServices";
import {
  getThisWeeksArtistOfTheWeek,
  getThisWeeksPublisherOfTheWeek,
} from "../../features/app/CreatorSpotlightServices";
import Button from "./Button";
import { leftArrowIcon, rightArrowIcon } from "../../lib/icons";
import {
  buildHeroCarouselItems,
  loadHeroCarouselCoverStacks,
  toAlpineDataJson,
} from "../../features/app/utils";

const HeroCarousel = async () => {
  const [bookRes, artistRes, publisherRes] = await Promise.all([
    getThisWeeksBookOfTheWeek(),
    getThisWeeksArtistOfTheWeek(),
    getThisWeeksPublisherOfTheWeek(),
  ]);

  const [bookErr, bookOfTheWeek] = bookRes;
  const [artistErr, artistOfTheWeek] = artistRes;
  const [publisherErr, publisherOfTheWeek] = publisherRes;

  const { publisherCoverStack, artistCoverStack } =
    await loadHeroCarouselCoverStacks({
      publisherCreatorId:
        !publisherErr && publisherOfTheWeek
          ? publisherOfTheWeek.creatorId
          : null,
      artistCreatorId:
        !artistErr && artistOfTheWeek ? artistOfTheWeek.creatorId : null,
    });

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
      x-on:touchstart="handleTouchStart($event)"
      x-on:touchmove="handleTouchMove($event)"
      x-on:touchend="handleTouchEnd()"
    >
      <div class="hidden md:flex flex-wrap gap-3 px-4 py-3 text-sm sm:gap-6 sm:px-8 sm:py-4">
        <template x-for="(item, index) in items">
          <button
            x-on:click="go(index)"
            x-bind:class="active === index ? 'text-on-surface-strong border-b-2 border-outline-strong' : 'text-on-surface-weak'"
            class="pb-1 transition cursor-pointer"
            type="button"
            x-text="item.label"
          ></button>
        </template>
      </div>

      <section
        class="relative py-6 text-on-surface transition-colors duration-300 ease-out sm:py-8"
        x-bind:class="items[active] ? items[active].slideClass : ''"
      >
        {/* <!-- Slides: visual on top (mobile), left (md+) --> */}
        <div class="relative flex w-full min-h-0 items-center px-4 sm:px-8 md:min-h-[420px]">
          <template x-for="(item, index) in items">
            <div
              x-show="active === index"
              x-transition:enter="transition ease-out duration-500"
              x-transition:enter-start="opacity-0 translate-x-6"
              x-transition:enter-end="opacity-100 translate-x-0"
              class="grid w-full grid-cols-1 grid-rows-[auto_auto] gap-6 md:grid-cols-[3fr_2fr] md:grid-rows-1 md:gap-10 md:items-center"
            >
              <div class="relative order-1 flex w-full justify-center md:order-0 ">
                <template x-if="item.coverStack && item.coverStack.length >= 2">
                  <div class="grid w-full max-w-[700px] grid-cols-2 gap-2 min-[480px]:grid-cols-4 min-[480px]:gap-3">
                    <template x-for="(url, i) in item.coverStack">
                      <img
                        x-bind:src="url"
                        x-bind:class="i >= 2 ? 'hidden min-[480px]:block' : ''"
                        class="w-full aspect-3/4 rounded-md shadow-md object-cover"
                      />
                    </template>
                  </div>
                </template>
                <template x-if="!item.coverStack || item.coverStack.length < 2">
                  <img
                    x-bind:src="item.image"
                    class="max-h-[220px] rounded-lg shadow-xl transition duration-500 hover:scale-102 sm:max-h-[300px] md:max-h-[340px]"
                  />
                </template>
              </div>
              <div class="order-2 flex w-full max-w-md flex-col gap-2 md:order-0">
                <p
                  class="text-sm text-center md:text-left"
                  x-text="item.label"
                ></p>
                <h2
                  class="text-2xl font-semibold text-on-surface-strong sm:text-4xl text-center md:text-left"
                  x-text="item.title"
                ></h2>
                <template x-if="item.text">
                  <p
                    class="mb-2 text-on-surface text-center md:text-left"
                    x-text="item.text"
                  ></p>
                </template>

                <div class="flex justify-center md:justify-start">
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
            </div>
          </template>
        </div>

        <button
          x-show="items.length > 1"
          x-on:click="prev()"
          type="button"
          class="hidden md:block absolute left-2 z-10 -translate-y-1/2 sm:left-6 md:left-10 top-1/2 cursor-pointer"
        >
          {leftArrowIcon}
        </button>

        <button
          x-show="items.length > 1"
          x-on:click="next()"
          type="button"
          class="hidden md:block absolute right-2 z-10 -translate-y-1/2 sm:right-6 md:right-10 top-1/2 cursor-pointer"
        >
          {rightArrowIcon}
        </button>
      </section>
    </div>
  );
};

export default HeroCarousel;
