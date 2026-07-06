import { jsx } from "hono/jsx/jsx-runtime";
const FileUploadInput = ({
  label,
  maxSize = "Max 5MB",
  required = false,
  multiple = false,
  accept = "image/*",
  name,
  isDisabled = false,
  isVisible = false,
  ...restProps
}) => {
  const styleClass = isVisible ? "w-full max-w-md overflow-clip rounded-radius border border-outline bg-surface-alt/50 text-sm file:mr-4 file:border-none file:bg-surface-alt file:px-4 file:py-2 file:font-medium file:text-on-surface-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-75 dark:border-outline-dark dark:bg-surface-dark-alt/50" : "sr-only";
  return /* @__PURE__ */ jsx(
    "input",
    {
      id: "fileInput",
      type: "file",
      name,
      "x-ref": "fileInput",
      class: styleClass,
      accept,
      multiple,
      disabled: isDisabled,
      ...restProps
    }
  );
};
var FileUpload_default = FileUploadInput;
export {
  FileUpload_default as default
};
