import { getTodaysBookOfTheDay } from "../../features/app/BOTDServices";
import {
  getThisWeeksArtistOfTheWeek,
  getThisWeeksPublisherOfTheWeek,
} from "../../features/app/CreatorSpotlightServices";
import {
  buildHeroCarouselItems,
  loadHeroCarouselCoverStacks,
  toAlpineDataJson,
} from "../../features/app/utils";
import { leftArrowIcon, rightArrowIcon } from "../../lib/icons";
import Button from "./Button";

const HeroCarouselFeatureCard = async () => {
  const [bookRes, artistRes, publisherRes] = await Promise.all([
    getTodaysBookOfTheDay(),
    getThisWeeksArtistOfTheWeek(),
    getThisWeeksPublisherOfTheWeek(),
  ]);

  const [bookErr, bookOfTheDay] = bookRes;
  const [artistErr, artistOfTheWeek] = artistRes;
  const [publisherErr, publisherOfTheWeek] = publisherRes;

  if (artistErr || publisherErr) {
    return <></>;
  }

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
    bookErr ? null : bookOfTheDay,
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
      <div class="hidden md:flex flex-wrap gap-3 py-3 sm:gap-8 border-b border-outline">
        <template x-for="(item, index) in items">
          <button
            x-on:click="go(index)"
            x-bind:class="active === index ? 'text-on-surface-strong border-b-2 border-accent' : 'text-on-surface-weak border-b-2 border-transparent'"
            class="pb-2 kicker transition cursor-pointer"
            type="button"
            x-text="item.label"
          ></button>
        </template>
      </div>

      <section
        class="border-t-2 border-b-2 border-on-surface-strong relative overflow-hidden text-on-surface transition-colors duration-300 ease-out"
        x-bind:class="items[active] ? items[active].slideClass : ''"
      >
        <div class="relative min-h-[480px] overflow-hidden rounded-radius border border-outline md:h-[500px]">
          <template x-for="(item, index) in items">
            <div
              x-show="active === index"
              x-transition:enter="transition ease-out duration-500"
              x-transition:enter-start="opacity-0 translate-x-6"
              x-transition:enter-end="opacity-100 translate-x-0"
              class="absolute inset-0"
            >
              <div class="grid h-full grid-cols-1 md:grid-cols-2">
                <div class="flex flex-col items-center justify-center order-2 sm:p-8 lg:p-12">
                  <div class="max-w-xl flex flex-col items-center justify-center gap-2">
                    <p class="kicker text-accent" x-text="item.label"></p>
                    <p
                      class="font-display text-3xl font-medium leading-tight text-on-surface-strong text-balance sm:text-5xl"
                      x-text="item.title"
                    ></p>
                    <template x-if="item.text">
                      <p
                        class=" max-w-md text-sm leading-6 text-on-surface sm:text-base"
                        x-text="item.text"
                      ></p>
                    </template>

                    <div class="mt-1 mb-4 flex items-center gap-3 group">
                      <a x-bind:href="item.link" class="cursor-pointer">
                        <Button
                          variant="solid"
                          color="primary"
                          width="lg"
                          x-bind:href="item.link"
                        >
                          <span class="inline-flex items-center">
                            View feature
                            <span class="w-0 overflow-hidden opacity-0 group-hover:w-6 group-hover:opacity-100 transition-all duration-300 ease-in-out whitespace-nowrap">
                              &nbsp;→
                            </span>
                          </span>
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>

                <div class="order-1 relative border-b border-outline/70  sm:px-4 sm:py-6 md:order-2 md:h-full md:min-h-[240px] md:border-b-0 md:px-0 md:py-0">
                  <a
                    x-bind:href="item.link"
                    class="flex h-full w-full items-center justify-center md:justify-end cursor-pointer"
                  >
                    <img
                      x-bind:src="item.image || ''"
                      x-bind:alt="item.title"
                      class="h-auto w-full max-h-[220px] object-contain sm:max-h-[260px] md:h-full md:max-h-none md:w-full"
                    />
                  </a>
                </div>
              </div>
            </div>
          </template>

          <div class="absolute inset-x-0 bottom-4 z-20 flex items-center justify-center gap-2 md:hidden">
            <template x-for="(item, index) in items">
              <button
                type="button"
                x-on:click="go(index)"
                class="h-2.5 w-2.5 rounded-full border border-outline/70 transition"
                x-bind:class="active === index ? 'bg-on-surface-strong' : 'bg-surface/70'"
                x-bind:aria-label="`Go to ${item.label}`"
              ></button>
            </template>
          </div>

          <button
            x-show="items.length > 1"
            x-on:click="prev()"
            type="button"
            class="group flex absolute left-2 top-1/2 z-20 size-8 md:size-11 -translate-y-1/2 items-center justify-center  text-on-surface-strong  transition duration-300 ease-out hover:-translate-x-1 sm:left-4 cursor-pointer"
          >
            <span class="transition-transform duration-300 ease-out group-hover:-translate-x-0.5">
              {leftArrowIcon}
            </span>
          </button>
          <button
            x-show="items.length > 1"
            x-on:click="next()"
            type="button"
            class="group flex absolute right-2 top-1/2 z-20 size-8 md:size-11 -translate-y-1/2 items-center justify-center text-on-surface-strong transition duration-300 ease-out hover:translate-x-1 sm:right-4 cursor-pointer"
          >
            <span class="transition-transform duration-300 ease-out group-hover:translate-x-0.5">
              {rightArrowIcon}
            </span>
          </button>
        </div>
      </section>
    </div>
  );
};

export default HeroCarouselFeatureCard;
