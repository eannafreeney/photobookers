const ImagePreview = () => (
  <>
    <div x-show="previewUrl" class="relative w-full md:w-80">
      <p class="text-sm text-on-surface-variant mb-2">Image Preview</p>
      <img
        x-bind:src="previewUrl"
        class="w-full rounded border"
        alt="Book cover"
      />
    </div>
  </>
);

export default ImagePreview;
