import { fadeTransition } from "../../../lib/transitions";
import Button from "../../app/Button";
import Form from "../../app/Form";
import SectionTitle from "../../app/SectionTitle";
import FileUploadInput from "../ui/FileUpload";
import InputLabel from "../ui/InputLabel";

type Props = {
  initialImages: { id: string; url: string }[]; // actual DB records
  bookId: string;
};

const BookGalleryForm = ({ initialImages, bookId }: Props) => {
  const attrs = {
    "x-on:ajax:before": "onBefore()",
    "x-on:ajax:success": "onSuccess($event)",
    "x-on:ajax:error": "onError($event)",
  };

  return (
    <div class="space-y-4">
      <SectionTitle>Book Gallery</SectionTitle>
      <Form
        x-data={`bookGalleryForm({
        initialImages: ${JSON.stringify(initialImages)}
        })`}
        action={`/dashboard/books/edit/${bookId}/images`}
        {...{ "x-target.error": "notification-message" }}
        x-on:submit="submitForm($event)"
        {...attrs}
      >
        <div class="space-y-4">
          <ImagePreviewGrid />
          <FileUploadInput
            label="Add Images"
            multiple
            x-on:change="onFilesChange"
            x-ref="fileInput"
          />
          <p x-show="error" class="text-sm text-danger" x-text="error"></p>
          <input
            type="hidden"
            name="removedIds"
            x-bind:value="JSON.stringify(removedIds)"
          />
          <div class="flex gap-2">
            <Button
              variant="solid"
              color="primary"
              x-bind:disabled="isLoading || !hasChanges"
            >
              <span x-show="!isLoading">Save</span>
              <span x-show="isLoading">Saving…</span>
            </Button>
            <Button
              type="button"
              variant="solid"
              color="secondary"
              x-show="hasChanges"
              x-on:click="reset()"
            >
              <span>Reset</span>
            </Button>
          </div>
          <ImagePreviewLightbox />
        </div>
      </Form>
    </div>
  );
};

export default BookGalleryForm;

const ImagePreviewGrid = () => (
  <>
    <div class="grid grid-cols-4 gap-4" x-show="images.length > 0">
      <template x-for="(img, index) in images" x-bind:key="img.id">
        <div class="relative group">
          <img
            x-bind:src="img.previewUrl"
            class="w-full aspect-square object-cover rounded border cursor-pointer"
            alt="Gallery image"
            x-on:click="previewImage = img.previewUrl"
          />
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

    {/* Empty State */}
    <div
      x-show="images.length === 0"
      class="border-2 border-dashed border-outline rounded-lg p-12 text-center text-on-surface"
    >
      <p>No images yet. Add some below.</p>
    </div>
  </>
);

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
