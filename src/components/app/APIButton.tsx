import clsx from "clsx";
import { ChildType } from "../../../types";

type APIButtonProps = {
  id: string;
  xTarget: string;
  action: string;
  disabled?: boolean;
  buttonText: ChildType;
  hiddenInput?: { name: string; value: boolean };
  isDisabled?: boolean;
};

const APIButton = ({
  id,
  xTarget,
  action,
  buttonText,
  hiddenInput,
  isDisabled = false,
}: APIButtonProps) => {
  const alpineAttrs = {
    "x-data": "{ isSubmitting: false }",
    "x-on:ajax:before": "isSubmitting = true",
    "x-on:ajax:after": "$dispatch('dialog:open')",
    "x-target": xTarget,
    "x-target.error": "modal-root",
  };

  return (
    <form
      id={id}
      method="post"
      action={action}
      class="whitespace-nowrap w-full rounded-radius border px-4 py-2 text-sm font-medium tracking-wide transition hover:opacity-75 text-center bg-transparentw-full text-secondary border-secondary"
      {...alpineAttrs}
    >
      {hiddenInput?.value !== undefined && (
        <input
          type="hidden"
          name={hiddenInput.name}
          value={hiddenInput.value ? "true" : "false"}
        />
      )}
      <button
        class="flex cursor-pointer items-center justify-center gap-2 hover:cursor-pointer w-full disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isDisabled}
      >
        {buttonText}
      </button>
    </form>
  );
};

export default APIButton;
