import clsx from "clsx";
import { ChildType } from "../../../types";

type APIButtonProps = {
  id: string;
  action: string;
  method?: "get" | "post";
  disabled?: boolean;
  buttonText: ChildType;
  hiddenInput?: { name: string; value: boolean };
  isDisabled?: boolean;
};

const APIButton = ({
  id,
  action,
  method = "post",
  buttonText,
  hiddenInput,
  isDisabled = false,
}: APIButtonProps) => {
  const alpineAttrs = {
    "x-data": "{ isSubmitting: false }",
    "@ajax:before": "isSubmitting = true",
    "@ajax:after": "$dispatch('dialog:open'); isSubmitting = false",
    "@ajax:error": "isSubmitting = false",
    "x-target": `${id} toast modal-root`,
    "x-target.error": "toast modal-root",
    "x-target.401": "modal-root",
  };

  return (
    <form
      id={id}
      x-sync
      method={method}
      action={action}
      class={clsx(
        "whitespace-nowrap w-full rounded-radius border px-4 py-2 text-sm font-medium tracking-wide transition hover:opacity-75 text-center bg-transparent text-secondary",
        isDisabled ? "border-secondary/50" : "border-secondary",
      )}
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
        class="flex cursor-pointer items-center justify-center gap-2 hover:cursor-pointer w-full disabled:opacity-50"
        disabled={isDisabled}
      >
        {buttonText}
      </button>
    </form>
  );
};

export default APIButton;
