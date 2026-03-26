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
      class="relative w-full overflow-hidden"
    >
      {/* slides container: active image controls container height */}
      <div
        class="relative w-full"
        x-on:touchstart="handleTouchStart($event)"
        x-on:touchmove="handleTouchMove($event)"
        x-on:touchend="handleTouchEnd()"
      >
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
