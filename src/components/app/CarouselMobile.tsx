import { imageSkeletonIcon } from "../../lib/icons";
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
      class="relative w-full overflow-hidden aspect-square"
    >
      {/* slides container: one grid cell so height = tallest slide */}
      <div
        class="absolute inset-0 flex items-center justify-center bg-surface-variant/30 animate-pulse"
        x-show="!loaded"
        x-transition:leave="transition ease-out duration-200"
        aria-hidden="true"
      >
        {imageSkeletonIcon}
      </div>
      <div
        class="w-full grid grid-cols-1 grid-rows-1 col-start-1 row-start-1"
        x-on:touchstart="handleTouchStart($event)"
        x-on:touchmove="handleTouchMove($event)"
        x-on:touchend="handleTouchEnd()"
      >
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
              x-on:load="onSlideImageLoad(index)"
            />
          </div>
        </template>
      </div>

      {/* indicators */}
      {showIndicators && (
        <div class="flex justify-center gap-4 my-4 px-2">
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
  );
};

export default CarouselMobile;
