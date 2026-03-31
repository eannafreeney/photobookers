import { dragHandleIcon } from "../../../../lib/icons";

const ImagePreviewGrid = () => {
  const reorderAttrs = {
    draggable: true,
    "@dragstart": "onReorderDragStart(index)",
    "@dragenter.prevent": "onReorderDragEnter(index)",
    "@dragover.prevent": true,
    "@dragend": "onReorderDragEnd()",
    "@drop.prevent": true,
    ":class":
      "dragOverIndex === index ? 'ring-2 ring-primary scale-[0.98]' : ''",
  };

  return (
    <>
      <div class="grid grid-cols-4 gap-4" x-show="images.length > 0">
        <template x-for="(img, index) in images" x-bind:key="img.id">
          <div class="relative group" {...reorderAttrs}>
            <img
              x-bind:src="img.previewUrl"
              class="w-full aspect-square object-cover rounded border cursor-pointer"
              alt="Gallery image"
              x-on:click="previewImage = img.previewUrl"
            />
            {/* Drag handle indicator */}
            <div class="absolute -top-2 left-1/2 -translate-x-1/2 rounded bg-black/55 text-white p-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity pointer-events-none">
              {dragHandleIcon()}
            </div>
            <button
              type="button"
              x-on:click="removeImage(index)"
              class="absolute cursor-pointer top-1 right-1 bg-danger text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {removeIcon}
            </button>
            <span
              class="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-2 py-0.5 rounded"
              x-text="index + 1"
            ></span>
          </div>
        </template>
      </div>
    </>
  );
};

export default ImagePreviewGrid;

const removeIcon = (
  <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);
