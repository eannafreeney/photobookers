import FileUploadInput from "../../../../components/forms/FileUpload";
import FormButtons from "../../../../components/forms/FormButtons";
import TextArea from "../../../../components/forms/TextArea";
import DragAndDropArea from "../../images/components/DragAndDropArea";

const MessageForm = ({ creatorId }: { creatorId: string }) => {
  const alpineAttrs = {
    "x-data": `messageForm()`,
    "x-on:submit": "submitForm($event)",
    "x-target": `toast creator-messages creator-messages-${creatorId}`,
    "x-on:ajax:error": "isSubmitting = false",
    "x-on:ajax:success": "onSuccess()",
  };

  return (
    <div>
      <h2 class="text-lg font-semibold text-on-surface-strong">Write a post</h2>
      <form
        id="message-form"
        method="post"
        enctype="multipart/form-data"
        action={`/dashboard/messages/${creatorId}`}
        class="flex flex-col gap-4"
        {...alpineAttrs}
      >
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
        <DragAndDropArea />
        <FileUploadInput
          label="Add Images"
          name="image"
          x-on:change="onFileChange($event)"
          x-ref="fileInput"
          // isDisabled={!canUploadImage(user, book)}
        />
        <FormButtons buttonText="Publish post" loadingText="Publishing…" />
      </form>
    </div>
  );
};

export default MessageForm;
