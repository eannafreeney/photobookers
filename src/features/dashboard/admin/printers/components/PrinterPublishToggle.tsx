import FormPatch from "../../../../../components/forms/FormPatch";
import type { PrinterStatus } from "../../../../../db/types";

type Props = {
  printerId: string;
  status: PrinterStatus;
};

const PrinterPublishToggle = ({ printerId, status }: Props) => {
  const isPublished = status === "published";
  const intent = isPublished ? "unpublish" : "publish";

  const alpineAttrs = {
    "x-data": `{ isPublished: ${isPublished} }`,
    "x-target": `printer-publish-toggle-${printerId} toast`,
    "x-target.error": "toast",
    "x-on:ajax:error": `isPublished = ${isPublished}`,
    "x-target.back": `toast printer-publish-toggle-${printerId}`,
  };

  return (
    <FormPatch
      id={`printer-publish-toggle-${printerId}`}
      action={`/dashboard/admin/printers/${printerId}`}
      {...alpineAttrs}
    >
      <input type="hidden" name="intent" value={intent} />
      <label
        class="cursor-pointer"
        title={isPublished ? "Unpublish" : "Publish"}
      >
        <input
          type="checkbox"
          class="peer sr-only"
          checked={isPublished}
          aria-label={isPublished ? "Unpublish" : "Publish"}
          x-on:change="$root.requestSubmit()"
        />
        <div class="relative h-6 w-11 after:h-5 after:w-5 peer-checked:after:translate-x-5 rounded-full border border-outline bg-surface-alt after:absolute after:bottom-0 after:left-[0.0625rem] after:top-0 after:my-auto after:rounded-full after:bg-on-surface after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:bg-on-primary peer-focus:outline-2 peer-focus:outline-offset-2 peer-focus:outline-outline-strong peer-focus:peer-checked:outline-primary peer-active:outline-offset-0"></div>
      </label>
    </FormPatch>
  );
};

export default PrinterPublishToggle;
