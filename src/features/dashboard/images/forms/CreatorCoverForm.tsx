import Button from "../../../../components/app/Button";
import SectionTitle from "../../../../components/app/SectionTitle";
import FileUploadInput from "../../../../components/forms/FileUpload";
import ImagePreview from "../../../../components/forms/ImagePreview";
import { AuthUser } from "../../../../../types";
import { canUploadImage } from "../../../../lib/permissions";
import { Creator } from "../../../../db/schema";
import DragAndDropArea from "../components/DragAndDropArea";

type Props = {
  initialUrl: string | null;
  creator: Creator;
  user: AuthUser;
};

const CreatorCoverForm = ({ initialUrl, creator, user }: Props) => {
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
        action={`/dashboard/images/creators/${creator.id}/cover`}
        enctype="multipart/form-data"
        class="space-y-4"
        {...alpineAttrs}
      >
        <div class="space-y-4">
          <ImagePreview />
          <DragAndDropArea />
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
