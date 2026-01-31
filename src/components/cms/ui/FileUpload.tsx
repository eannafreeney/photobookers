import InputLabel from "./InputLabel";

type FileUploadProps = {
  label: string;
  maxSize?: string;
  required?: boolean;
  multiple?: boolean;
  accept?: string;
  name?: string;
  onChange?: (event: Event) => void;
};

const FileUploadInput = ({
  label,
  maxSize = "Max 10MB",
  required = false,
  multiple = false,
  accept = "image/*",
  name,
  ...restProps
}: FileUploadProps) => (
  <div
    class="relative flex w-64 max-w-sm flex-col gap-2
   text-on-surface dark:text-on-surface-dark"
  >
    <InputLabel label={label} required={required} />
    <input
      id="fileInput"
      type="file"
      name={name}
      class="w-full max-w-md overflow-clip rounded-radius border border-outline bg-surface-alt/50 text-sm file:mr-4 file:border-none file:bg-surface-alt file:px-4 file:py-2 file:font-medium file:text-on-surface-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-75 cursor-pointer"
      accept={accept}
      multiple={multiple}
      {...restProps}
    />
    <small class="pl-0.5">{`PNG, JPG, WebP - ${maxSize}`}</small>
  </div>
);

export default FileUploadInput;
