import { fadeTransition } from "../../../lib/transitions";

const ImagePreview = () => (
  <>
    <template x-if="previewUrl">
      <div class="relative w-full md:w-80">
        <img
          x-bind:src="previewUrl"
          class="w-full rounded border"
          alt="Book cover"
          {...fadeTransition}
        />
      </div>
    </template>
    <div
      x-show="previewUrl === null"
      class="border-2 border-dashed border-outline rounded-lg p-12 text-center text-on-surface"
      {...fadeTransition}
    >
      <p>No cover yet. Add one below.</p>
    </div>
  </>
);

export default ImagePreview;
