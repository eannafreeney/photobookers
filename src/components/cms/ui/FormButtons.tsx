import { fadeTransition } from "../../../lib/transitions";
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
    <div class="flex items-center gap-4 mt-8">
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
            {loadingText} {loadingIcon()}
          </span>
        </div>
      </Button>
    </div>
  );
};

const loadingIcon = () => {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      class="size-5 animate-spin motion-reduce:animate-none fill-on-primary dark:fill-on-primary-dark"
    >
      <path
        opacity="0.25"
        d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z"
      />
      <path d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z" />
    </svg>
  );
};
export default FormButtons;
