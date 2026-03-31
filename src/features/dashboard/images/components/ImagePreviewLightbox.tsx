import { fadeTransition } from "../../../../lib/transitions";

const ImagePreviewLightbox = () => {
  return (
    <div
      x-show="previewImage"
      {...fadeTransition}
      x-on:click="previewImage = null"
      {...{ "x-on:keydown.escape.window": "previewImage = null" }}
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
    >
      <img
        x-bind:src="previewImage"
        {...{ "x-on:click.stop": "previewImage = null" }}
        class="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
        alt="Preview"
      />
      <button
        type="button"
        x-on:click="previewImage = null"
        class="absolute top-4 right-4 text-white/80 hover:text-white transition-colors cursor-pointer"
      >
        {closeIcon}
      </button>
    </div>
  );
};

export default ImagePreviewLightbox;

const closeIcon = (
  <svg class="size-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);
