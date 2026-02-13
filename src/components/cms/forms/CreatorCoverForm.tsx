import Button from "../../app/Button";
import SectionTitle from "../../app/SectionTitle";
import FileUploadInput from "../ui/FileUpload";
import ImagePreview from "../ui/ImagePreview";

type Props = {
  initialUrl: string | null;
  creatorId: string;
};

const CreatorCoverForm = ({ initialUrl, creatorId }: Props) => {
  const initialUrlString = initialUrl ? JSON.stringify(initialUrl) : null;

  const alpineAttrs = {
    "x-data": `creatorCoverForm({initialUrl: ${initialUrlString}})`,
    "x-target": "toast nav-avatar",
    "x-target.error": "toast",
    "@ajax:before": "onBefore()",
    "@ajax:success": "onSuccess()",
    "@ajax:error": "onError()",
  };

  return (
    <div class="space-y-4">
      <SectionTitle>Profile Image</SectionTitle>
      <form
        method="post"
        action={`/dashboard/images/creators/${creatorId}/cover`}
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
          <p x-show="isCompressing" class="text-sm text-gray-500">
            Compressing image…
          </p>
          <p x-show="error" class="text-sm text-red-600" x-text="error"></p>
          <Button
            variant="solid"
            color="primary"
            width="lg"
            x-bind:disabled="isSubmitting || previewUrl === initialUrl || isCompressing"
          >
            <span x-show="!isSubmitting">Save</span>
            <span x-show="isSubmitting">Saving…</span>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreatorCoverForm;
