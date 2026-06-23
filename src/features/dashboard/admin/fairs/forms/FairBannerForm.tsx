import Button from "../../../../../components/app/Button";
import FileUploadInput from "../../../../../components/forms/FileUpload";
import SectionTitle from "../../../../../components/app/SectionTitle";
import ImagePreview from "../../../../../components/forms/ImagePreview";
import DragAndDropArea from "../../../../dashboard/images/components/DragAndDropArea";

type Props = {
  initialUrl: string | null;
  fairId: string;
};

const FairBannerForm = ({ initialUrl, fairId }: Props) => {
  const alpineAttrs = {
    "x-data": `fairBannerForm({initialUrl: ${JSON.stringify(initialUrl)}})`,
    "x-target": "toast",
    "x-target.error": "toast",
    "@ajax:before": "onBefore()",
    "@ajax:success": "onSuccess()",
    "@ajax:error": "onError()",
  };

  return (
    <div id="fair-banner-form" class="space-y-4">
      <SectionTitle>Fair Banner Image</SectionTitle>
      <form
        action={`/dashboard/images/fairs/${fairId}/banner`}
        method="post"
        enctype="multipart/form-data"
        {...alpineAttrs}
      >
        <div class="space-y-4">
          <div
            class="flex flex-col md:flex-row items-center gap-4 justify-evenly"
            x-show="previewUrl || initialUrl"
            x-cloak
          >
            <ImagePreview />
          </div>
          <DragAndDropArea />
          <FileUploadInput
            label="Add Fair Banner Image"
            name="banner"
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

export default FairBannerForm;
