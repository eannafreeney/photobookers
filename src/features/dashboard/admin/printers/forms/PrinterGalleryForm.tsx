import Button from "../../../../../components/app/Button";
import FileUploadInput from "../../../../../components/forms/FileUpload";
import DragAndDropArea from "../../../../dashboard/images/components/DragAndDropArea";

const PrinterGalleryForm = ({ printerId }: { printerId: string }) => {
  return (
    <form
      method="post"
      action={`/dashboard/images/printers/${printerId}/gallery`}
      enctype="multipart/form-data"
      class="flex flex-col gap-3"
      x-data="printerGalleryForm()"
      x-on:submit="submitForm($event)"
    >
      <div class="grid grid-cols-4 gap-3" x-show="images.length > 0" x-cloak>
        <template x-for="(img, index) in images" x-bind:key="img.id">
          <div class="relative">
            <img
              x-bind:src="img.previewUrl"
              alt=""
              class="aspect-[3/4] w-full object-cover border border-outline"
            />
            <button
              type="button"
              class="absolute top-1 right-1 bg-danger text-white text-xs px-2 py-1"
              x-on:click="removeImage(index)"
            >
              Remove
            </button>
          </div>
        </template>
      </div>
      <DragAndDropArea prompt="Drop book photos here, or click to choose several." />
      <FileUploadInput
        label="Add images"
        name="images"
        multiple
        x-on:change="onFilesChange"
        x-ref="fileInput"
      />
      <p x-show="isCompressing" class="text-sm text-on-surface-weak">
        Compressing images…
      </p>
      <p x-show="error" class="text-sm text-danger" x-text="error"></p>
      <Button
        variant="solid"
        color="primary"
        width="fit"
        x-bind:disabled="isSubmitting || isCompressing || images.length === 0"
      >
        <span x-show="!isSubmitting">Upload</span>
        <span x-show="isSubmitting">Uploading…</span>
      </Button>
    </form>
  );
};

export default PrinterGalleryForm;
