const ImagePreview = () => (
  <>
    <template x-if="previewUrl">
      <div class="relative w-full md:w-80">
        <img
          x-bind:src="previewUrl"
          class="w-full rounded border"
          alt="Book cover"
        />
      </div>
    </template>
    <div
      x-show="previewUrl === null"
      class="border-2 border-dashed border-outline rounded-lg p-12 text-center text-on-surface"
    >
      <p>No cover yet. Add one below.</p>
    </div>
  </>
);

export default ImagePreview;
