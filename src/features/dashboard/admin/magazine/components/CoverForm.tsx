import Button from "@/components/app/Button";
import FileUploadInput from "@/components/forms/FileUpload";
import ImagePreview from "@/components/forms/ImagePreview";
import DragAndDropArea from "@/features/dashboard/images/components/DragAndDropArea";

type Props = {
  issueId: string;
  initialUrl: string | null;
};

/** Landscape issue cover — upload becomes `coverUrl` for index + homepage. */
const MagazineCoverForm = ({ issueId, initialUrl }: Props) => {
  const alpineAttrs = {
    "x-data": `magazineCoverForm({initialUrl: ${JSON.stringify(initialUrl)}})`,
    "x-target": "toast",
    "x-target.error": "toast",
    "@ajax:before": "onBefore()",
    "@ajax:success": "onSuccess()",
    "@ajax:error": "onError()",
  };

  return (
    <div
      id="magazine-cover-form"
      class="flex flex-col gap-3 border-t border-outline pt-4"
    >
      <span class="kicker text-accent">Cover image</span>
      <p class="text-sm text-on-surface">
        Landscape works best on the homepage (roughly 16:10). Upload produces
        the public cover.
      </p>
      <form
        action={`/dashboard/admin/magazine/${issueId}/cover`}
        method="post"
        enctype="multipart/form-data"
        {...alpineAttrs}
      >
        <div class="space-y-4">
          <div
            class="flex flex-col items-center gap-4 md:flex-row md:justify-evenly"
            x-show="previewUrl || initialUrl"
            x-cloak
          >
            <ImagePreview />
          </div>
          <DragAndDropArea prompt="Drag and drop or click to upload a landscape cover." />
          <FileUploadInput
            label="Cover image"
            name="cover"
            x-on:change="onFileChange"
          />

          <p x-show="error" class="text-sm text-danger" x-text="error"></p>
          <div class="flex gap-2">
            <Button
              variant="solid"
              color="primary"
              width="auto"
              x-bind:disabled="isSubmitting || previewUrl === initialUrl || isCompressing"
            >
              <span x-show="!isSubmitting">Save cover</span>
              <span x-show="isSubmitting">Saving…</span>
            </Button>
            <Button
              variant="solid"
              color="inverse"
              width="auto"
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

export default MagazineCoverForm;
