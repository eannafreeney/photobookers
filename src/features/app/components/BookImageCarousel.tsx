type Props = {
  images: string[];
  alt: string;
};

/** List-page image carousel — swipe, arrows, dots. */
const BookImageCarousel = ({ images, alt }: Props) => {
  if (images.length === 0) {
    return (
      <div class="flex aspect-[4/5] w-full items-center justify-center border border-outline bg-surface text-xs text-on-surface-weak">
        No images
      </div>
    );
  }

  const multiple = images.length > 1;

  return (
    <div
      x-data={`carouselForm(${JSON.stringify(images)})`}
      class="group relative w-full overflow-hidden border border-outline bg-surface-alt"
    >
      <div
        class="relative w-full"
        x-on:touchstart="handleTouchStart($event)"
        x-on:touchmove="handleTouchMove($event)"
        x-on:touchend="handleTouchEnd()"
      >
        <div
          class="flex items-center h-full transition-transform duration-300 ease-out"
          x-bind:style="`transform: translateX(-${(currentSlideIndex - 1) * 100}%)`"
        >
          <template x-for="slide in slides">
            <div class="h-full w-full shrink-0">
              <img
                class="h-full w-full object-contain"
                x-bind:src="slide.imgSrc"
                alt={alt}
                loading="lazy"
              />
            </div>
          </template>
        </div>

        {multiple ? (
          <>
            <button
              type="button"
              aria-label="Previous image"
              x-on:click="previous()"
              class="absolute left-2 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center border border-outline bg-surface/80 text-on-surface-strong opacity-0 backdrop-blur-sm transition-opacity hover:border-accent hover:text-accent group-hover:opacity-100 cursor-pointer"
            >
              {arrowLeftIcon}
            </button>
            <button
              type="button"
              aria-label="Next image"
              x-on:click="next()"
              class="absolute right-2 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center border border-outline bg-surface/80 text-on-surface-strong opacity-0 backdrop-blur-sm transition-opacity hover:border-accent hover:text-accent group-hover:opacity-100 cursor-pointer"
            >
              {arrowRightIcon}
            </button>
            <div class="absolute bottom-2 left-0 right-0 z-10 flex justify-center gap-1.5">
              <template x-for="(slide, index) in slides">
                <button
                  type="button"
                  class="size-1.5 rounded-full transition"
                  x-on:click="currentSlideIndex = index + 1"
                  x-bind:class="currentSlideIndex === index + 1 ? 'bg-on-surface-strong w-4' : 'bg-on-surface/50'"
                  x-bind:aria-label="'Image ' + (index + 1)"
                ></button>
              </template>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

const arrowLeftIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    stroke="currentColor"
    fill="none"
    stroke-width="2.5"
    class="size-4"
    aria-hidden="true"
  >
    <path d="M15.75 19.5 8.25 12l7.5-7.5" />
  </svg>
);

const arrowRightIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    stroke="currentColor"
    fill="none"
    stroke-width="2.5"
    class="size-4"
    aria-hidden="true"
  >
    <path d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);

export default BookImageCarousel;
