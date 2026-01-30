import clsx from "clsx";
import { ChildType } from "../../../types";

type APIButtonProps = {
  id: string;
  xTarget: string;
  action: string;
  disabled?: boolean;
  buttonText: ChildType;
  hiddenInput?: { name: string; value: boolean };
};

const APIButton = ({
  id,
  xTarget,
  action,
  disabled = false,
  buttonText,
  hiddenInput,
}: APIButtonProps) => {
  const alpineAttrs = {
    "x-on:ajax:before": "isLoading = true",
    "x-on:ajax:after": "$dispatch('dialog:open')",
    "x-target": xTarget,
    "x-target.error": "modal-root",
    "x-data": "{ isLoading: false }",
    // "x-ajax:after": "isLoading = false",
  };

  return (
    <form
      id={id}
      method="post"
      action={action}
      class="whitespace-nowrap rounded-radius border px-4 py-2 text-sm font-medium tracking-wide transition hover:opacity-75 text-center bg-transparentw-full text-secondary border-secondary"
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
        class="flex items-center justify-center gap-2 hover:cursor-pointer w-full disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={disabled}
      >
        {buttonText}
      </button>
    </form>
  );
};

export default APIButton;
