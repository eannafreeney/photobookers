import FileUploadInput from "../../../components/forms/FileUpload";
import FormButtons from "../../../components/forms/FormButtons";
import TextArea from "../../../components/forms/TextArea";
import DragAndDropArea from "../../dashboard/images/components/DragAndDropArea";

// Reuses the shared `messageForm` Alpine client (registered in dashboard.js,
// which loads on all /dashboard pages) for image preview + client validation.
const CollectorPostForm = () => {
  const formConfig = JSON.stringify({ body: "", previewUrl: null });

  const alpineAttrs = {
    "x-data": `messageForm(${formConfig})`,
    "x-on:submit": "submitForm($event)",
    "x-target": "toast collector-posts-table-body",
    "x-target.error": "toast",
    "x-on:ajax:error": "isSubmitting = false",
    "x-on:ajax:success": "onSuccess()",
  };

  return (
    <div>
      <h2 class="text-lg font-semibold text-on-surface-strong">
        Share what's new
      </h2>
      <form
        id="collector-post-form"
        method="post"
        enctype="multipart/form-data"
        action="/dashboard/posts"
        class="flex flex-col gap-4"
        {...alpineAttrs}
      >
        <TextArea
          name="form.body"
          required
          maxLength={5000}
          placeholder="Share a recent find, a favourite spread, or what you're hunting for…"
          validateInput="validateField('body')"
        />
        <div x-show="previewUrl" x-cloak>
          <img
            x-bind:src="previewUrl"
            alt="Post image preview"
            class="w-full max-w-md rounded-radius object-cover border border-outline"
          />
        </div>
        <DragAndDropArea prompt="Drag and drop or click here to upload an image." />
        <FileUploadInput
          label="Add image"
          name="image"
          x-on:change="onFileChange($event)"
          x-ref="fileInput"
        />
        <FormButtons buttonText="Publish post" loadingText="Publishing…" />
      </form>
    </div>
  );
};

export default CollectorPostForm;
