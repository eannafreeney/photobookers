import type { HeroCarouselItem } from "../../client/components/heroCarousel";
import { toAlpineDataJson } from "../../features/app/utils";
import { heroLcpImageSources } from "../../lib/imageUrl";
import { leftArrowIcon, rightArrowIcon } from "../../lib/icons";
import Button from "./Button";

const HERO_IMAGE_CLASS =
  "h-auto w-full max-h-[220px] object-contain sm:max-h-[260px] md:h-full md:max-h-none md:w-full";
const HERO_SLIDE_GRID_CLASS =
  "flex h-full w-full min-w-0 flex-col items-center justify-evenly overflow-hidden pt-6 pb-12 md:grid md:grid-cols-2 md:justify-items-stretch md:overflow-visible md:pt-0 md:pb-0";
const HERO_TEXT_COLUMN_CLASS =
  "flex w-full min-w-0 max-w-full flex-col items-center justify-center order-2 overflow-hidden px-4 py-4 text-center sm:p-8 lg:p-12";
const HERO_TEXT_INNER_CLASS =
  "flex w-full min-w-0 max-w-full flex-col items-center justify-center gap-2 overflow-hidden";
const HERO_BUTTON_ROW_CLASS =
  "mt-1 mb-4 flex items-center justify-center gap-3 group md:justify-start";
/** One line + ellipsis on mobile; wrap normally from md up. */
const HERO_TITLE_CLASS =
  "block w-full min-w-0 font-display text-3xl font-medium leading-tight text-on-surface-strong text-center truncate sm:text-5xl md:whitespace-normal md:overflow-visible md:text-clip md:text-balance";
const HERO_SLIDE_ROOT_CLASS =
  "col-start-1 row-start-1 min-w-0 w-full overflow-hidden transition-opacity duration-500 md:absolute md:inset-0 md:overflow-visible";
/** Intrinsic ratio for book-cover CLS reservation (actual display size is CSS-controlled). */
const HERO_IMAGE_WIDTH = 600;
const HERO_IMAGE_HEIGHT = 800;

type Props = {
  heroItems: HeroCarouselItem[];
};

const HeroCarouselFeatureCard = ({ heroItems }: Props) => {
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
      <section
        class={`border-t-2 border-b-2 border-on-surface-strong relative text-on-surface transition-colors duration-300 ease-out md:h-[500px] ${firstItem.slideClass ?? ""}`}
        x-bind:class="items[active] ? items[active].slideClass : ''"
      >
        {/* Mobile: opacity-stack in one grid cell so height = tallest slide (x-show would jump). */}
        <div class="relative min-w-0 overflow-hidden rounded-radius md:h-full">
          <div class="grid min-w-0 md:h-full">
            <HeroCarouselLcpSlide
              item={firstItem}
              x-bind:class="active === 0 ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'"
              x-bind:aria-hidden="active !== 0"
              class={HERO_SLIDE_ROOT_CLASS}
            />

            <template x-for="(item, index) in items.slice(1)">
              <div
                x-bind:class="active === index + 1 ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'"
                x-bind:aria-hidden="active !== index + 1"
                class={HERO_SLIDE_ROOT_CLASS}
              >
                <div class={HERO_SLIDE_GRID_CLASS}>
                  <div class={HERO_TEXT_COLUMN_CLASS}>
                    <div class={HERO_TEXT_INNER_CLASS}>
                      <p class="kicker text-accent" x-text="item.label"></p>
                      <p
                        class={HERO_TITLE_CLASS}
                        x-bind:title="item.title"
                        x-text="item.title"
                      ></p>
                      <template x-if="item.text">
                        <p
                          class="max-w-md text-sm leading-6 text-on-surface sm:text-base"
                          x-text="item.text"
                        ></p>
                      </template>

                      <div class={HERO_BUTTON_ROW_CLASS}>
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

                  <div class="order-1 relative w-full min-w-0 border-b border-outline/70 sm:px-4 sm:py-6 md:order-2 md:h-full md:min-h-[240px] md:border-b-0 md:px-0 md:py-0">
                    <a
                      x-bind:href="item.link"
                      class="flex h-full w-full items-center justify-center md:justify-end cursor-pointer"
                    >
                      <img
                        x-bind:src="item.image || ''"
                        x-bind:alt="item.title"
                        width={HERO_IMAGE_WIDTH}
                        height={HERO_IMAGE_HEIGHT}
                        class={HERO_IMAGE_CLASS}
                      />
                    </a>
                  </div>
                </div>
              </div>
            </template>
          </div>

          <p
            x-show="items.length > 1"
            class="hidden md:block absolute inset-x-0 top-6 z-20 kicker tabular-nums text-center text-on-surface-strong"
            aria-live="polite"
            x-text="`${active + 1}-${items.length}`"
          >
            {heroItems.length > 1 ? `1-${heroItems.length}` : null}
          </p>

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
        </div>

        <button
          x-show="items.length > 1"
          x-on:click="prev()"
          type="button"
          class="hidden md:flex group absolute left-2 top-1/2 z-20 size-8 -translate-y-1/2 items-center justify-center text-on-surface-strong transition duration-300 ease-out hover:-translate-x-1 md:left-3 md:size-11 cursor-pointer"
        >
          <span class="transition-transform duration-300 ease-out group-hover:-translate-x-0.5">
            {leftArrowIcon}
          </span>
        </button>
        <button
          x-show="items.length > 1"
          x-on:click="next()"
          type="button"
          class=" hidden md:flex group absolute right-2 top-1/2 z-20 size-8 -translate-y-1/2 items-center justify-center text-on-surface-strong transition duration-300 ease-out hover:translate-x-1 md:right-3 md:size-11 cursor-pointer"
        >
          <span class="transition-transform duration-300 ease-out group-hover:translate-x-0.5">
            {rightArrowIcon}
          </span>
        </button>
      </section>
    </div>
  );
};

type HeroCarouselLcpSlideProps = {
  item: HeroCarouselItem;
  class?: string;
  "x-bind:class"?: string;
  "x-bind:aria-hidden"?: string;
};

/** First slide only — static HTML so the hero image is discoverable before Alpine runs. */
const HeroCarouselLcpSlide = ({
  item,
  class: className,
  "x-bind:class": xBindClass,
  "x-bind:aria-hidden": xBindAriaHidden,
}: HeroCarouselLcpSlideProps) => {
  const imageSources = item.image ? heroLcpImageSources(item.image) : null;

  return (
    <div
      class={className}
      {...(xBindClass ? { "x-bind:class": xBindClass } : {})}
      {...(xBindAriaHidden ? { "x-bind:aria-hidden": xBindAriaHidden } : {})}
    >
      <div class={HERO_SLIDE_GRID_CLASS}>
        <div class={HERO_TEXT_COLUMN_CLASS}>
          <div class={HERO_TEXT_INNER_CLASS}>
            <p class="kicker text-accent">{item.label}</p>
            <p class={HERO_TITLE_CLASS} title={item.title}>
              {item.title}
            </p>
            {item.text ? (
              <p class="max-w-md text-sm leading-6 text-on-surface sm:text-base">
                {item.text}
              </p>
            ) : null}

            <div class={HERO_BUTTON_ROW_CLASS}>
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

        <div class="order-1 relative w-full min-w-0 border-b border-outline/70 sm:px-4 sm:py-6 md:order-2 md:h-full md:min-h-[240px] md:border-b-0 md:px-0 md:py-0">
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
