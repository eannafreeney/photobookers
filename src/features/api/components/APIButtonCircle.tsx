import clsx from "clsx";
import { ChildType } from "../../../../types";

type APIButtonCircleProps = {
  buttonText: ChildType;
  id: string;
  action: string;
  method?: "get" | "post";
  hiddenInput?: { name: string; value: boolean };
  /** Posted so the API can render this exact control back into the page. */
  variant?: string;
  errorTarget?: string;
  buttonType?: "circle" | "default";
  isDisabled?: boolean;
  /** Filled style for an "on" state (e.g. already following). */
  isActive?: boolean;
  tooltipText?: string;
  shouldRefreshFollowedCreators?: boolean;
  shouldRefreshCreatorPosts?: boolean;
};

const APIButtonCircle = ({
  id,
  action,
  method = "post",
  variant,
  hiddenInput,
  buttonText,
  buttonType,
  isDisabled = false,
  isActive = false,
  tooltipText = "",
  shouldRefreshFollowedCreators = false,
  shouldRefreshCreatorPosts = false,
}: APIButtonCircleProps) => {
  const attrs = {
    "x-data": "{ isSubmitting: false }",
    "@ajax:before": "isSubmitting = true",
    "@ajax:after": "$dispatch('dialog:open'); isSubmitting = false;",
    "@ajax:error": "isSubmitting = false",
    // See APIButton: only the 401 response carries `modal-root`.
    "x-target": id,
    "x-target.error": "toast",
    "x-target.401": "modal-root",
  };

  return (
    <form
      id={id}
      x-sync
      method={method}
      action={action}
      class={clsx(
        "inline-flex justify-center items-center aspect-square whitespace-nowrap size-8 rounded-full p-1 text-sm font-medium tracking-wide transition hover:opacity-75 text-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-surface-dark active:opacity-100 active:outline-offset-0 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer",
        isActive
          ? "bg-on-surface-strong text-on-primary"
          : "bg-gray-200 text-on-surface-dark",
      )}
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
      {variant && <input type="hidden" name="variant" value={variant} />}
      {shouldRefreshFollowedCreators && (
        <input
          type="hidden"
          name="shouldRefreshFollowedCreators"
          value="true"
        />
      )}
      {shouldRefreshCreatorPosts && (
        <input type="hidden" name="shouldRefreshCreatorPosts" value="true" />
      )}
      <button
        class="cursor-pointer disabled:opacity-30"
        disabled={isDisabled}
        title={tooltipText}
      >
        {buttonText}
      </button>
    </form>
  );
};

export default APIButtonCircle;
