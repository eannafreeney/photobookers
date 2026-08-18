import FileUploadInput from "../../../components/forms/FileUpload";
import FormButtons from "../../../components/forms/FormButtons";
import TextArea from "../../../components/forms/TextArea";
import DragAndDropArea from "../../dashboard/images/components/DragAndDropArea";
import { POST_BODY_MAX_LENGTH } from "../../../domain/posts/utils";

// Reuses the shared `messageForm` Alpine client (registered in dashboard.js,
// which loads on all /dashboard pages) for image preview + client validation.
type Props = {
  disabled?: boolean;
  postId?: string;
  initialBody?: string;
  initialImageUrl?: string | null;
  placeholder?: string;
};

const PostForm = ({
  disabled = false,
  postId,
  initialBody,
  initialImageUrl,
  placeholder = "Share a recent find, a favourite spread, or what you're hunting for…",
}: Props) => {
  const isEdit = Boolean(postId);
  const formConfig = JSON.stringify({
    body: initialBody ?? "",
    previewUrl: initialImageUrl ?? null,
    isEdit,
  });

  const alpineAttrs = disabled
    ? {
        "x-data": `messageForm(${formConfig})`,
        "x-on:submit.prevent": "",
      }
    : {
        "x-data": `messageForm(${formConfig})`,
        "x-on:submit": "submitForm($event)",
        "x-target": isEdit ? "modal-root toast" : "toast",
        "x-target.error": "toast",
        "x-on:ajax:error": "isSubmitting = false",
        "x-on:ajax:success": isEdit
          ? "onSuccess(); $dispatch('dialog:close')"
          : "onSuccess()",
      };

  return (
    <div>
      {!isEdit && (
        <h2 class="mb-3 text-lg font-semibold text-on-surface-strong">
          Share what's new
        </h2>
      )}
      <form
        id={isEdit ? "post-edit-form" : "post-form"}
        method="post"
        enctype="multipart/form-data"
        action={isEdit ? `/dashboard/posts/${postId}` : "/dashboard/posts"}
        class="flex flex-col gap-4"
        {...alpineAttrs}
      >
        {isEdit ? <input type="hidden" name="_method" value="PATCH" /> : null}
        <fieldset
          disabled={disabled}
          class={`flex flex-col gap-4 ${disabled ? "opacity-50" : ""}`}
        >
          <div
            class={
              isEdit
                ? "grid grid-cols-1 gap-4 sm:grid-cols-2"
                : "flex flex-col gap-4"
            }
          >
            <TextArea
              label="Post"
              name="form.body"
              required
              maxLength={POST_BODY_MAX_LENGTH}
              minRows={isEdit ? 8 : 5}
              placeholder={placeholder}
              validateInput="validateField('body')"
            />
            <div class="flex flex-col gap-4">
              <div x-show="previewUrl" x-cloak>
                <img
                  x-bind:src="previewUrl"
                  alt="Post image preview"
                  class={
                    isEdit
                      ? "h-40 w-full rounded-radius object-cover border border-outline"
                      : "w-full max-w-md rounded-radius object-cover border border-outline"
                  }
                />
              </div>
              <DragAndDropArea prompt="Drag and drop or click here to upload an image." />
              <FileUploadInput
                label="Add image"
                name="image"
                x-on:change="onFileChange($event)"
                x-ref="fileInput"
              />
            </div>
          </div>
          <FormButtons
            buttonText={isEdit ? "Save changes" : "Publish post"}
            loadingText={isEdit ? "Saving…" : "Publishing…"}
            isDisabled={disabled}
            showCancelButton={isEdit}
          />
        </fieldset>
      </form>
    </div>
  );
};

export default PostForm;
