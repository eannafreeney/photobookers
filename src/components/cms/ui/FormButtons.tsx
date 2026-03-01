import { loadingIcon } from "../../../lib/icons";
import Button from "../../app/Button";

type Props = {
  buttonText?: string;
  loadingText?: string;
  showCancelButton?: boolean;
};

const FormButtons = ({
  buttonText = "Save",
  loadingText = "Saving...",
  showCancelButton = false,
}: Props) => {
  return (
    <div class="flex items-center gap-4">
      {showCancelButton && (
        <button
          type="button"
          class="btn btn-outline"
          onclick="window.history.back()"
        >
          Cancel
        </button>
      )}
      <Button
        variant="solid"
        color="primary"
        x-bind:disabled="isSubmitting || !isFormValid"
      >
        <div class="flex items-center justify-center gap-2">
          <span x-show="!isSubmitting">{buttonText}</span>
          <span
            x-show="isSubmitting"
            class="flex items-center justify-center gap-2"
          >
            {loadingText} {loadingIcon}
          </span>
        </div>
      </Button>
    </div>
  );
};

export default FormButtons;
