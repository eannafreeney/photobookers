import { fadeTransition } from "../../lib/transitions";

type CarouselTouchProps = {
  images: string[];
  showIndicators?: boolean;
};

const CarouselMobile = ({
  images = [],
  showIndicators = true,
}: CarouselTouchProps) => {
  if (images.length === 0) return <></>;

  return (
    <div
      x-init="autoplay"
      x-data={`carouselForm(${JSON.stringify(images)})`}
      class="relative w-full overflow-hidden"
    >
      {/* slides container: active image controls container height */}
      <div
        class="relative w-full min-h-[220px]"
        x-on:touchstart="handleTouchStart($event)"
        x-on:touchmove="handleTouchMove($event)"
        x-on:touchend="handleTouchEnd()"
      >
        <div
          class="absolute inset-0 z-20 bg-surface-variant/30 animate-pulse"
          x-show="!isFirstImageLoaded"
          aria-hidden="true"
        >
          <div class="w-full h-full flex items-center justify-center">
            {imageSkeletonIcon}
          </div>
        </div>
        <template x-for="(slide, index) in slides">
          <div
            class="w-full flex items-center justify-center min-h-0"
            x-show="currentSlideIndex === index + 1"
            x-bind:class="currentSlideIndex === index + 1 ? 'relative z-10' : 'absolute inset-0 z-0 pointer-events-none'"
            {...fadeTransition}
          >
            <img
              class="block w-full max-w-full h-auto object-contain"
              x-bind:src="slide.imgSrc"
              x-bind:alt="slide.imgAlt"
              x-on:load="if (index === 0) isFirstImageLoaded = true"
              x-on:error="if (index === 0) isFirstImageLoaded = true"
            />
          </div>
        </template>
        {/* indicators */}
        {showIndicators && (
          <div class="absolute bottom-2 left-0 right-0 z-10 flex justify-center gap-2 pb-2">
            <template x-for="(slide, index) in slides">
              <button
                class="size-2 rounded-full transition"
                x-on:click="currentSlideIndex = index + 1"
                x-bind:class="[currentSlideIndex === index + 1 ? 'bg-on-surface' : 'bg-on-surface/50']"
                x-bind:aria-label="'slide ' + (index + 1)"
              ></button>
            </template>
          </div>
        )}
      </div>
    </div>
  );
};

export default CarouselMobile;

export const imageSkeletonIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
    class="w-full h-full fill-on-surface/20 dark:fill-on-surface-dark/20"
    preserveAspectRatio="xMidYMid meet"
  >
    <path
      fill-rule="evenodd"
      d="M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-2.69l-2.22-2.219a.75.75 0 0 0-1.06 0l-1.91 1.909.47.47a.75.75 0 1 1-1.06 1.06L6.53 8.091a.75.75 0 0 0-1.06 0l-2.97 2.97ZM12 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"
      clip-rule="evenodd"
    />
  </svg>
);
