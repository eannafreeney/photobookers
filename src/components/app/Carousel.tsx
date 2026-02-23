import { fadeTransition } from "../../lib/transitions";

type Props = {
  images: string[];
};

const Carousel = ({ images = [] }: Props) => {
  if (images.length === 0) return <></>;

  return (
    <div
      x-data={`carouselForm(${JSON.stringify(images)})`}
      class="relative w-full overflow-hidden bg-white rounded-radius border border-outline p-2"
    >
      {/* Main slide area */}
      <div class="w-full overflow-hidden">
        <div
          class="flex transition-transform duration-300 ease-out"
          x-bind:style="`transform: translateX(-${(currentSlideIndex - 1) * 100}%)`"
        >
          <template x-for="slide in slides">
            <div class="w-full shrink-0 h-auto">
              <img
                class="w-full h-full object-contain"
                x-bind:src="slide.imgSrc"
                x-bind:alt="slide.imgAlt"
              />
            </div>
          </template>
        </div>
      </div>

      {/* Thumbnail strip */}
      <div class="flex gap-2 mt-4 overflow-x-auto pb-2">
        <template x-for="(slide, idx) in slides">
          <button
            x-on:click="currentSlideIndex = idx + 1"
            class="shrink-0 w-16 h-16 md:w-20 md:h-20 overflow-hidden rounded cursor-pointer border-2 transition-all"
            x-bind:class="currentSlideIndex == idx + 1 ? 'border-primary opacity-100' : 'border-transparent opacity-60 hover:opacity-100'"
          >
            <img
              class="w-full h-full object-cover"
              x-bind:src="slide.imgSrc"
              x-bind:alt="slide.imgAlt"
            />
          </button>
        </template>
      </div>
    </div>
  );
};

export default Carousel;

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
