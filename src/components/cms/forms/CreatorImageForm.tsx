import Button from "../../app/Button";
import SectionTitle from "../../app/SectionTitle";
import FileUploadInput from "../ui/FileUpload";
import ImagePreview from "../ui/ImagePreview";

type Props = {
  initialUrl: string | null;
  creatorId: string;
};

const CreatorImageForm = ({ initialUrl, creatorId }: Props) => {
  const initialUrlString = initialUrl ? JSON.stringify(initialUrl) : null;

  const alpineAttrs = {
    "x-data": `creatorImageForm({initialUrl: ${initialUrlString}})`,
    "x-target.error": "toast",
    "x-target": "toast",
    "x-on:ajax:before": "onBefore()",
    "x-on:ajax:success": "onSuccess($event)",
    "x-on:ajax:error": "onError($event)",
    "x-on:submit": "submitForm($event)",
  };

  return (
    <div class="space-y-4">
      <SectionTitle>Cover Image</SectionTitle>
      <form
        method="post"
        action={`/dashboard/creators/edit/${creatorId}/image`}
        enctype="multipart/form-data"
        class="space-y-4"
        {...alpineAttrs}
      >
        <div class="space-y-4">
          <ImagePreview />
          <FileUploadInput
            label="Replace Image"
            name="cover"
            x-on:change="onFileChange"
            x-ref="fileInput"
          />
          <p x-show="error" class="text-sm text-red-600" x-text="error"></p>
          <Button
            variant="solid"
            color="primary"
            width="lg"
            x-bind:disabled="isSubmitting || previewUrl === initialUrl"
          >
            <span x-show="!isSubmitting">Save</span>
            <span x-show="isSubmitting">Saving…</span>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreatorImageForm;
