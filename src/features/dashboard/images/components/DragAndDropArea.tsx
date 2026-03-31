const DragAndDropArea = () => {
  const dragAttrs = {
    "@dragenter.prevent": "onDragEnter($event)",
    "@dragover.prevent": "onDragOver($event)",
    "@dragleave.prevent": "onDragLeave($event)",
    "@drop.prevent": "onDrop($event)",
    "@click": "$refs.fileInput.click()",
    ":class": "isDragOver ? 'border-success bg-success/5' : 'border-outline'",
  };

  return (
    <div
      class="rounded-lg border-2 border-dashed p-6 text-center transition cursor-pointer flex flex-col gap-2"
      {...dragAttrs}
    >
      <div class="flex items-center justify-center mb-4">{dragAndDropIcon}</div>
      <p class="text-sm text-on-surface/80">
        Drag and drop or click here to upload images.
      </p>
      <p class="text-xs text-on-surface/80">PNG, JPG, WebP - Max 5MB</p>
    </div>
  );
};

export default DragAndDropArea;

const dragAndDropIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    aria-hidden="true"
    fill="currentColor"
    class="w-12 h-12 opacity-50"
  >
    <path
      fill-rule="evenodd"
      d="M10.5 3.75a6 6 0 0 0-5.98 6.496A5.25 5.25 0 0 0 6.75 20.25H18a4.5 4.5 0 0 0 2.206-8.423 3.75 3.75 0 0 0-4.133-4.303A6.001 6.001 0 0 0 10.5 3.75Zm2.03 5.47a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 1 0 1.06 1.06l1.72-1.72v4.94a.75.75 0 0 0 1.5 0v-4.94l1.72 1.72a.75.75 0 1 0 1.06-1.06l-3-3Z"
      clip-rule="evenodd"
    />
  </svg>
);
