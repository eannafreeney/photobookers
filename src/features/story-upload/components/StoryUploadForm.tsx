import Button from "../../../components/app/Button";
import FileUploadInput from "../../../components/forms/FileUpload";
import FormPost from "../../../components/forms/FormPost";
import DragAndDropArea from "../../dashboard/images/components/DragAndDropArea";
import type { StoryUploadKind } from "../utils";
import { storyUploadLabel } from "../utils";

type Props = {
  token: string;
  kind: StoryUploadKind;
  title: string;
  credits: string | null;
};

const StoryUploadForm = ({ token, kind, title, credits }: Props) => {
  const alpineAttrs = {
    "x-data": "storyUploadForm()",
    "x-target": "toast",
    "x-target.error": "toast",
    "@ajax:before": "onBefore()",
    "@ajax:success": "onSuccess()",
    "@ajax:error": "onError()",
  };

  return (
    <FormPost
      id="story-upload-form"
      action={`/story-upload/${token}`}
      enctype="multipart/form-data"
      {...alpineAttrs}
    >
      <div class="space-y-4">
        <div class="flex flex-col items-center gap-4" x-show="previewUrl" x-cloak>
          <div
            class="relative w-full max-w-[240px] overflow-hidden rounded bg-gray-100"
            style="aspect-ratio: 9/16;"
          >
            <img
              x-bind:src="previewUrl"
              alt="Story preview"
              class="absolute inset-0 h-full w-full object-cover"
            />
            <div
              class="absolute inset-0"
              style="background: linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, transparent 35%, transparent 72%, rgba(0,0,0,0.2) 100%);"
            />
            <div
              class="absolute left-0 right-0"
              style="top: 9.375%; padding-left: 7.4%; padding-right: 7.4%;"
            >
              <div
                class="text-[10px] font-semibold uppercase tracking-[0.35em] text-white"
                style="font-size: 10px; line-height: 1;"
              >
                {storyUploadLabel(kind)}
              </div>
              <div
                class="font-semibold text-white"
                style="font-size: 16px; line-height: 1.2; margin-top: 8px; font-family: Georgia, serif;"
              >
                {title}
              </div>
              {credits ? (
                <div
                  class="text-white/90"
                  style="font-size: 12px; line-height: 1.2; margin-top: 6px;"
                >
                  {credits}
                </div>
              ) : null}
            </div>
          </div>
        </div>
        <DragAndDropArea />
        <FileUploadInput
          label="Add image"
          name="image"
          required
          x-on:change="onFileChange"
          x-ref="fileInput"
        />
        <p x-show="error" class="text-sm text-red-600" x-text="error"></p>
        <div class="flex gap-2">
          <Button
            variant="solid"
            color="primary"
            x-bind:disabled="isSubmitting || isCompressing"
          >
            <span x-show="!isSubmitting">Upload</span>
            <span x-show="isSubmitting">Uploading…</span>
          </Button>
        </div>
      </div>
    </FormPost>
  );
};

export default StoryUploadForm;
