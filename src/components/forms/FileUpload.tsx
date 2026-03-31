import InputLabel from "./InputLabel";
import { AuthUser } from "../../../types";
import { canUploadImage } from "../../lib/permissions";

type FileUploadProps = {
  label: string;
  maxSize?: string;
  required?: boolean;
  multiple?: boolean;
  accept?: string;
  name?: string;
  isDisabled?: boolean;
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
  ...restProps
}: FileUploadProps) => (
  <input
    id="fileInput"
    type="file"
    name={name}
    x-ref="fileInput"
    class="sr-only"
    accept={accept}
    multiple={multiple}
    disabled={isDisabled}
    {...restProps}
  />
);

export default FileUploadInput;
