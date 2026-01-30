import { ChildType } from "../../../types";

type APIButtonCircleProps = {
  buttonText: ChildType;
  id: string;
  xTarget: string;
  action: string;
  hiddenInput: { name: string; value: boolean };
  errorTarget?: string;
  buttonType?: "circle" | "default";
  isDisabled?: boolean;
};

const APIButtonCircle = ({
  id,
  xTarget,
  action,
  hiddenInput,
  buttonText,
  errorTarget = "modal-root",
  buttonType,
  isDisabled = false,
}: APIButtonCircleProps) => {
  const attrs = {
    "x-data": "{ isSubmitting: false }",
    "x-on:ajax:before": "isSubmitting = true",
    "x-on:ajax:after": "$dispatch('dialog:open')",
    "x-target": xTarget,
    "x-target.error": errorTarget,
  };

  return (
    <form
      id={id}
      method="post"
      action={action}
      class="inline-flex justify-center items-center aspect-square whitespace-nowrap rounded-full bg-surface-alt p-2 text-sm font-medium tracking-wide text-on-surface-dark transition hover:opacity-75 text-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-surface-dark active:opacity-100 active:outline-offset-0 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
      {...attrs}
    >
      {hiddenInput?.value !== undefined && (
        <input
          type="hidden"
          name={hiddenInput.name}
          value={hiddenInput.value ? "true" : "false"}
        />
      )}
      {buttonType && (
        <input type="hidden" name="buttonType" value={buttonType} />
      )}
      <button
        class="cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
        disabled={isDisabled}
      >
        {buttonText}
      </button>
    </form>
  );
};

export default APIButtonCircle;
