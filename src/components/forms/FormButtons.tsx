import { loadingIcon } from "../../lib/icons";
import Button, { button } from "../app/Button";
import Link from "../app/Link";

type Props = {
  buttonText?: string;
  loadingText?: string;
  showCancelButton?: boolean;
  isDisabled?: boolean;
  viewHref?: string;
};

const FormButtons = ({
  buttonText = "Save",
  loadingText = "Saving...",
  showCancelButton = false,
  isDisabled = false,
  viewHref,
}: Props) => {
  return (
    <div class="flex flex-wrap items-center gap-4 mt-4">
      {showCancelButton && (
        <Button
          variant="outline"
          type="button"
          color="inverse"
          x-on:click="$dispatch('dialog:close')"
        >
          Cancel
        </Button>
      )}
      <Button
        variant="solid"
        color="primary"
        width={viewHref ? "fit" : "full"}
        isDisabled={isDisabled}
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
      {viewHref ? (
        <Link
          href={viewHref}
          target="_blank"
          className={button({
            variant: "outline",
            color: "inverse",
            width: "fit",
          })}
        >
          View
        </Link>
      ) : null}
    </div>
  );
};

export default FormButtons;
