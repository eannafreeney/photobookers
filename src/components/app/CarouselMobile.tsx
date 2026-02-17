import { fadeTransition } from "../../lib/transitions";

type CarouselTouchProps = {
  images: string[];
};

const CarouselMobile = ({ images = [] }: CarouselTouchProps) => {
  if (images.length === 0) return <></>;

  return (
    <div
      x-data={`carousel(${JSON.stringify(images)})`}
      class="relative w-full overflow-hidden"
    >
      {/* previous button */}
      <button
        type="button"
        class="absolute left-0 top-1/2 z-5 flex rounded-full -translate-y-1/2 items-center justify-center bg-surface/40 p-2 text-on-surface transition hover:bg-surface/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:outline-offset-0 dark:bg-surface-dark/40 dark:text-on-surface-dark dark:hover:bg-surface-dark/60 dark:focus-visible:outline-primary-dark"
        aria-label="previous slide"
        x-on:click="previous()"
        x-show="slides.length > 1"
      >
        {leftArrowIcon}
      </button>

      {/* next button */}
      <button
        type="button"
        class="absolute right-0 top-1/2 z-5 flex rounded-full -translate-y-1/2 items-center justify-center bg-surface/40 p-2 text-on-surface transition hover:bg-surface/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:outline-offset-0 dark:bg-surface-dark/40 dark:text-on-surface-dark dark:hover:bg-surface-dark/60 dark:focus-visible:outline-primary-dark"
        aria-label="next slide"
        x-on:click="next()"
        x-show="slides.length > 1"
      >
        {rightArrowIcon}
      </button>

      {/* slides container: fixed height so no jump between different-size images */}
      <div class="relative w-full h-[30vh]  min-h-32">
        {/* slides stack: only one visible via x-show */}
        <div class="absolute inset-0">
          <template x-for="(slide, index) in slides">
            <div
              x-show="currentSlideIndex == index + 1"
              class="absolute inset-0"
              {...fadeTransition}
            >
              <img
                class="absolute w-full h-full inset-0 object-contain"
                x-bind:src="slide.imgSrc"
                x-bind:alt="slide.imgAlt"
              />
            </div>
          </template>
        </div>
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
