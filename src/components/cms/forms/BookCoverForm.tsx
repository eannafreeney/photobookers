import Button from "../../app/Button";
import FileUploadInput from "../ui/FileUpload";
import SectionTitle from "../../app/SectionTitle";
import ImagePreview from "../ui/ImagePreview";

type Props = {
  initialUrl: string | null;
  bookId: string;
};

const BookCoverForm = ({ initialUrl, bookId }: Props) => {
  const alpineAttrs = {
    "x-data":`bookCoverForm({initialUrl: ${JSON.stringify(initialUrl)}})`,
    "x-target": "toast",
    "x-target.error": "toast",
    "x-on:ajax:before": "onBefore()",
    "x-on:ajax:success": "onSuccess()",
    "x-on:ajax:error": "onError()",
  };

  return (
    <div class="space-y-4">
      <SectionTitle>Book Cover</SectionTitle>
      <form
        action={`/dashboard/images/books/${bookId}/cover`}
        method="post"
        enctype="multipart/form-data"
        {...alpineAttrs}
      >
        <div class="space-y-4">
          <ImagePreview />
          <FileUploadInput
            label="Add Book Cover"
            name="cover"
            required
            x-on:change="onFileChange"
            x-ref="fileInput"
          />
         
          <p x-show="error" class="text-sm text-red-600" x-text="error"></p>
          <div class="flex gap-2">
          <Button
            variant="solid"
            color="primary"
            x-bind:disabled="isSubmitting || previewUrl === initialUrl || isCompressing"
          >
            <span x-show="!isSubmitting">Save</span>
            <span x-show="isSubmitting">Saving…</span>
          </Button>
          <Button
            variant="solid"
            color="inverse"
            x-on:click="cancelSelection"
            x-bind:disabled="isSubmitting || previewUrl === initialUrl || isCompressing"
          >
            Cancel
          </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BookCoverForm;
