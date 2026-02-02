import Button from "../../app/Button";
import FileUploadInput from "../ui/FileUpload";
import SectionTitle from "../../app/SectionTitle";
import ImagePreview from "../ui/ImagePreview";

type Props = {
  initialUrl: string | null;
  bookId: string;
};

const BookImageForm = ({ initialUrl, bookId }: Props) => {
  const attrs = {
    "x-target": "toast",
    "x-on:ajax:before": "onBefore()",
    "x-on:ajax:success": "onSuccess($event)",
    "x-on:ajax:error": "onError($event)",
  };

  return (
    <div class="space-y-4">
      <SectionTitle>Book Cover</SectionTitle>
      <form
        x-data={`bookImageForm({
        initialUrl: ${JSON.stringify(initialUrl)}
        })`}
        action={`/dashboard/books/edit/${bookId}/cover`}
        method="POST"
        enctype="multipart/form-data"
        {...attrs}
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
          <p x-show="isCompressing" class="text-sm text-gray-500">
            Compressing image…
          </p>
          <p x-show="error" class="text-sm text-red-600" x-text="error"></p>
          <Button
            variant="solid"
            color="primary"
            x-bind:disabled="isSubmitting || previewUrl === initialUrl || isCompressing"
          >
            <span x-show="!isLoading">Save</span>
            <span x-show="isLoading">Saving…</span>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default BookImageForm;
