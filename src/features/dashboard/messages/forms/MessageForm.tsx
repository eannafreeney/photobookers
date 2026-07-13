import FileUploadInput from "../../../../components/forms/FileUpload";
import FormButtons from "../../../../components/forms/FormButtons";
import TextArea from "../../../../components/forms/TextArea";
import DragAndDropArea from "../../images/components/DragAndDropArea";

type MessageFormProps = {
  creatorId: string;
  messageId?: string;
  initialBody?: string;
  initialImageUrl?: string | null;
};

const MessageForm = ({
  creatorId,
  messageId,
  initialBody,
  initialImageUrl,
}: MessageFormProps) => {
  const isEdit = Boolean(messageId);
  const formConfig = JSON.stringify({
    body: initialBody ?? "",
    previewUrl: initialImageUrl ?? null,
  });

  const alpineAttrs = isEdit
    ? {
        "x-data": `messageForm(${formConfig})`,
        "x-on:submit": "submitForm($event)",
        "x-target": "modal-root toast messages-table-body",
        "x-target.error": "toast",
        "x-on:ajax:error": "isSubmitting = false",
        "@ajax:after":
          "$dispatch('messages:updated'), $dispatch('dialog:close')",
      }
    : {
        "x-data": `messageForm(${formConfig})`,
        "x-on:submit": "submitForm($event)",
        "x-target": "toast messages-table-body",
        "x-on:ajax:error": "isSubmitting = false",
        "x-on:ajax:success": "onSuccess()",
      };

  return (
    <div>
      {!isEdit && (
        <h2 class="text-lg font-semibold text-on-surface-strong">
          Write a post
        </h2>
      )}
      <form
        id="message-form"
        method="post"
        enctype="multipart/form-data"
        action={
          isEdit
            ? `/dashboard/messages/${creatorId}/${messageId}`
            : `/dashboard/messages/${creatorId}`
        }
        class="flex flex-col gap-4"
        {...alpineAttrs}
      >
        {isEdit ? <input type="hidden" name="_method" value="PATCH" /> : null}
        <TextArea
          name="form.body"
          required
          maxLength={5000}
          placeholder="Share fair dates, new work, or news with your followers…"
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
        <FormButtons
          buttonText={isEdit ? "Save changes" : "Publish post"}
          loadingText={isEdit ? "Saving…" : "Publishing…"}
        />
      </form>
    </div>
  );
};

export default MessageForm;
