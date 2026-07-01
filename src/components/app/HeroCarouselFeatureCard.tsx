import type { HeroCarouselItem } from "../../client/components/heroCarousel";
import { toAlpineDataJson } from "../../features/app/utils";
import { heroLcpImageSources } from "../../lib/imageUrl";
import { leftArrowIcon, rightArrowIcon } from "../../lib/icons";
import Button from "./Button";

const HERO_IMAGE_CLASS =
  "h-auto w-full max-h-[220px] object-contain sm:max-h-[260px] md:h-full md:max-h-none md:w-full object-cover";
/** Intrinsic ratio for book-cover CLS reservation (actual display size is CSS-controlled). */
const HERO_IMAGE_WIDTH = 600;
const HERO_IMAGE_HEIGHT = 800;

const HeroCarouselFeatureCard = ({
  heroItems,
}: {
  heroItems: HeroCarouselItem[];
}) => {
  if (heroItems.length === 0) {
    return <></>;
  }

  const firstItem = heroItems[0];

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
      {/* <div class="hidden md:flex flex-wrap gap-3 py-3 sm:gap-8 border-b border-outline">
        <template x-for="(item, index) in items">
          <button
            x-on:click="go(index)"
            x-bind:class="active === index ? 'text-on-surface-strong border-b-2 border-accent' : 'text-on-surface-weak border-b-2 border-transparent'"
            class="pb-2 kicker transition cursor-pointer"
            type="button"
            x-text="item.label"
          ></button>
        </template>
      </div> */}

      <section
        class={`pt-6 sm:pt-0 border-t-2 border-b-2 border-on-surface-strong relative overflow-hidden text-on-surface transition-colors duration-300 ease-out ${firstItem.slideClass ?? ""}`}
        x-bind:class="items[active] ? items[active].slideClass : ''"
      >
        <div class="relative overflow-hidden rounded-radius md:h-[500px]">
          <HeroCarouselLcpSlide
            item={firstItem}
            x-show="active === 0"
            class="md:absolute md:inset-0"
          />

          <template x-for="(item, index) in items.slice(1)">
            <div
              x-show="active === index + 1"
              x-transition:enter="transition ease-out duration-500"
              x-transition:enter-start="opacity-0 translate-x-6"
              x-transition:enter-end="opacity-100 translate-x-0"
              class="md:absolute md:inset-0"
            >
              <div class="grid grid-cols-1 pb-12 md:h-full md:grid-cols-2 md:pb-0">
                <div class="flex flex-col items-center justify-center order-2 px-4 py-4 sm:p-8 lg:p-12">
                  <div class="max-w-xl flex flex-col items-center justify-center gap-2">
                    <p class="kicker text-accent" x-text="item.label"></p>
                    <p
                      class="font-display text-3xl font-medium leading-tight text-on-surface-strong text-balance sm:text-5xl"
                      x-text="item.title"
                    ></p>
                    <template x-if="item.text">
                      <p
                        class="max-w-md text-sm leading-6 text-on-surface sm:text-base"
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

                <div class="order-1 relative border-b border-outline/70 sm:px-4 sm:py-6 md:order-2 md:h-full md:min-h-[240px] md:border-b-0 md:px-0 md:py-0">
                  <a
                    x-bind:href="item.link"
                    class="flex h-full w-full items-center justify-center md:justify-end cursor-pointer"
                  >
                    <img
                      x-bind:src="item.image || ''"
                      x-bind:alt="item.title"
                      class={HERO_IMAGE_CLASS}
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

type HeroCarouselLcpSlideProps = {
  item: HeroCarouselItem;
  class?: string;
  "x-show"?: string;
};

/** First slide only — static HTML so the hero image is discoverable before Alpine runs. */
const HeroCarouselLcpSlide = ({
  item,
  class: className,
  "x-show": xShow,
}: HeroCarouselLcpSlideProps) => {
  const imageSources = item.image ? heroLcpImageSources(item.image) : null;

  return (
    <div class={className} {...(xShow ? { "x-show": xShow } : {})}>
      <div class="grid grid-cols-1 pb-12 md:h-full md:grid-cols-2 md:pb-0">
        <div class="flex flex-col items-center justify-center order-2 px-4 py-4 sm:p-8 lg:p-12">
          <div class="max-w-xl flex flex-col items-center justify-center gap-2">
            <p class="kicker text-accent">{item.label}</p>
            <p class="font-display text-3xl font-medium leading-tight text-on-surface-strong text-balance sm:text-5xl">
              {item.title}
            </p>
            {item.text ? (
              <p class="max-w-md text-sm leading-6 text-on-surface sm:text-base">
                {item.text}
              </p>
            ) : null}

            <div class="mt-1 mb-4 flex items-center gap-3 group">
              <a href={item.link} class="cursor-pointer">
                <Button
                  variant="solid"
                  color="primary"
                  width="lg"
                  href={item.link}
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

        <div class="order-1 relative border-b border-outline/70 sm:px-4 sm:py-6 md:order-2 md:h-full md:min-h-[240px] md:border-b-0 md:px-0 md:py-0">
          <a
            href={item.link}
            class="flex h-full w-full items-center justify-center md:justify-end cursor-pointer"
          >
            {imageSources ? (
              <img
                src={imageSources.src}
                srcset={imageSources.srcSet}
                sizes={imageSources.sizes}
                alt={item.title}
                width={HERO_IMAGE_WIDTH}
                height={HERO_IMAGE_HEIGHT}
                fetchpriority="high"
                class={HERO_IMAGE_CLASS}
              />
            ) : null}
          </a>
        </div>
      </div>
    </div>
  );
};

export default HeroCarouselFeatureCard;
