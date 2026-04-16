type FileUploadProps = {
  label: string;
  maxSize?: string;
  required?: boolean;
  multiple?: boolean;
  accept?: string;
  name?: string;
  isDisabled?: boolean;
  isVisible?: boolean;
  onChange?: (event: Event) => void;
};

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
}: FileUploadProps) => {
  const styleClass = isVisible
    ? "w-full max-w-md overflow-clip rounded-radius border border-outline bg-surface-alt/50 text-sm file:mr-4 file:border-none file:bg-surface-alt file:px-4 file:py-2 file:font-medium file:text-on-surface-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-75 dark:border-outline-dark dark:bg-surface-dark-alt/50"
    : "sr-only";

  return (
    <input
      id="fileInput"
      type="file"
      name={name}
      x-ref="fileInput"
      class={styleClass}
      accept={accept}
      multiple={multiple}
      disabled={isDisabled}
      {...restProps}
    />
  );
};

export default FileUploadInput;
