import { ChildType } from "../../../types";

type APIButtonCircleProps = {
  buttonText: ChildType;
  id: string;
  action: string;
  hiddenInput: { name: string; value: boolean };
  errorTarget?: string;
  buttonType?: "circle" | "default";
  isDisabled?: boolean;
  tooltipText?: string;
};

const APIButtonCircle = ({
  id,
  action,
  hiddenInput,
  buttonText,
  buttonType,
  isDisabled = false,
  tooltipText = "",
}: APIButtonCircleProps) => {
  const attrs = {
    "x-data": "{ isSubmitting: false }",
    "@ajax:before": "isSubmitting = true",
    "@ajax:after": "$dispatch('dialog:open'); isSubmitting = false",
    "@ajax:error": "isSubmitting = false",
    "x-target": `${id} toast`,
    "x-target.error": "toast",
    "x-target.401": "modal-root",
  };

  return (
    <form
      id={id}
      method="post"
      action={action}
      class="inline-flex justify-center items-center aspect-square whitespace-nowrap rounded-full bg-surface-alt p-1 text-sm font-medium tracking-wide text-on-surface-dark transition hover:opacity-75 text-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-surface-dark active:opacity-100 active:outline-offset-0 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
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
        class="cursor-pointer disabled:opacity-50"
        disabled={isDisabled}
        title={tooltipText}
      >
        {buttonText}
      </button>
    </form>
  );
};

export default APIButtonCircle;
