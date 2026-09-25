import Button from "../../../../../components/app/Button";
import FileUploadInput from "../../../../../components/forms/FileUpload";
import ImagePreview from "../../../../../components/forms/ImagePreview";
import DragAndDropArea from "../../../../dashboard/images/components/DragAndDropArea";

const PrinterImageForm = ({
  printerId,
  imageUrl,
  kind,
}: {
  printerId: string;
  imageUrl: string | null;
  kind: "cover" | "banner";
}) => {
  const label = kind === "cover" ? "cover" : "banner";

  return (
    <form
      action={`/dashboard/images/printers/${printerId}/${kind}`}
      method="post"
      enctype="multipart/form-data"
      class="flex flex-col gap-3 max-w-md"
      x-data={`storeCoverForm({initialUrl: ${JSON.stringify(imageUrl)}})`}
      {...{
        "x-target": "toast",
        "x-target.error": "toast",
        "@ajax:before": "onBefore()",
        "@ajax:success": "onSuccess()",
        "@ajax:error": "onError()",
      }}
    >
      <div x-show="previewUrl" x-cloak class="w-32">
        <ImagePreview />
      </div>
      <DragAndDropArea prompt={`Drop a ${label}, or click to choose one.`} />
      <FileUploadInput
        label={kind === "cover" ? "Cover" : "Banner"}
        name={kind}
        x-on:change="onFileChange"
        x-ref="fileInput"
      />
      <p x-show="error" class="text-sm text-danger" x-text="error"></p>
      <Button
        variant="solid"
        color="primary"
        width="fit"
        x-bind:disabled="isSubmitting || previewUrl === initialUrl || isCompressing"
      >
        <span x-show="!isSubmitting">Save {label}</span>
        <span x-show="isSubmitting">Saving…</span>
      </Button>
    </form>
  );
};

export default PrinterImageForm;
