import { fadeTransition } from "../../lib/transitions";

type CarouselTouchProps = {
  images: string[];
};

const CarouselMobile = ({ images = [] }: CarouselTouchProps) => {
  if (images.length === 0) return <></>;

  return (
    <div
      x-init="autoplay"
      x-data={`carouselForm(${JSON.stringify(images)})`}
      class="relative w-full overflow-hidden"
    >
      {/* slides container: one grid cell so height = tallest slide */}
      <div class="relative w-full grid grid-cols-1 grid-rows-1">
        <template x-for="(slide, index) in slides">
          <div
            class="col-start-1 row-start-1 flex items-center justify-center min-h-0"
            x-bind:class="{ 'invisible': currentSlideIndex != index + 1 }"
            {...fadeTransition}
          >
            <img
              class="max-w-full w-full h-auto object-contain"
              x-bind:src="slide.imgSrc"
              x-bind:alt="slide.imgAlt"
            />
          </div>
        </template>
      </div>

      {/* indicators */}
      <div
        class="absolute rounded-radius bottom-3 md:bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-4 md:gap-3 bg-surface/75 px-1.5 py-1 md:px-2 dark:bg-surface-dark/75"
        role="group"
        aria-label="slides"
      >
        <template x-for="(slide, index) in slides">
          <button
            class="size-2 rounded-full transition bg-on-surface dark:bg-on-surface-dark"
            x-on:click="currentSlideIndex = index + 1"
            x-bind:class="[currentSlideIndex === index + 1 ? 'bg-on-surface dark:bg-on-surface-dark' : 'bg-on-surface/50 dark:bg-on-surface-dark/50']"
            x-bind:aria-label="'slide ' + (index + 1)"
          ></button>
        </template>
      </div>
    </div>
  );
};

export default CarouselMobile;

const leftArrowIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    stroke="currentColor"
    fill="none"
    stroke-width="3"
    class="size-5 md:size-6 pr-0.5"
    aria-hidden="true"
  >
    <path d="M15.75 19.5 8.25 12l7.5-7.5" />
  </svg>
);

const rightArrowIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    stroke="currentColor"
    fill="none"
    stroke-width="3"
    class="size-5 md:size-6 pl-0.5"
    aria-hidden="true"
  >
    <path d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);
