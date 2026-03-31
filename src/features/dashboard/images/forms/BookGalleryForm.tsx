import { fadeTransition } from "../../../../lib/transitions";
import { MAX_GALLERY_IMAGES_PER_BOOK } from "../../../../constants/images";
import Button from "../../../../components/app/Button";
import SectionTitle from "../../../../components/app/SectionTitle";
import FileUploadInput from "../../../../components/forms/FileUpload";
import { AuthUser } from "../../../../../types";
import { Book } from "../../../../db/schema";
import { canUploadImage } from "../../../../lib/permissions";
import { dragHandleIcon } from "../../../../lib/icons";
import DragAndDropArea from "../components/DragAndDropArea";
import ImagePreviewGrid from "../components/ImagePreviewGrid";
import ImagePreviewLightbox from "../components/ImagePreviewLightbox";

type Props = {
  initialImages: { id: string; url: string }[]; // actual DB records
  book: Book;
  user: AuthUser;
};

const BookGalleryForm = ({ initialImages, book, user }: Props) => {
  const initialImagesString = initialImages
    ? JSON.stringify(initialImages)
    : null;

  const alpineAttrs = {
    "x-data": `bookGalleryForm({initialImages: ${initialImagesString}})`,
    "x-target": "toast",
    "@ajax:before": "onBefore()",
    "@ajax:success": "onSuccess()",
    "@ajax:error": "onError($event)",
    "x-on:submit": "submitForm($event)",
  };

  return (
    <div class="space-y-4">
      <SectionTitle>Book Gallery</SectionTitle>
      <form
        enctype="multipart/form-data"
        method="post"
        action={`/dashboard/images/books/${book.id}/gallery`}
        {...alpineAttrs}
      >
        <div class="space-y-4">
          <div x-show="images.length > 0 || initialImages.length > 0" x-cloak>
            <ImagePreviewGrid />
          </div>
          <DragAndDropArea />
          <FileUploadInput
            label="Add Images"
            multiple
            x-on:change="onFilesChange"
            x-ref="fileInput"
            isDisabled={!canUploadImage(user, book)}
          />
          <p x-show="isCompressing" class="text-sm text-gray-500">
            Compressing image…
          </p>
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
              x-bind:disabled="isSubmitting || !hasChanges || isCompressing"
            >
              <span x-show="!isSubmitting">Save</span>
              <span x-show="isSubmitting">Saving…</span>
            </Button>
            <Button
              type="button"
              variant="solid"
              color="secondary"
              x-show="hasChanges"
              x-on:click="reset()"
            >
              <span>Undo Changes</span>
            </Button>
          </div>
          <ImagePreviewLightbox />
        </div>
      </form>
    </div>
  );
};

export default BookGalleryForm;
