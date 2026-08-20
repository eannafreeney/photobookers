import clsx from "clsx";
import { ChildType } from "../../../../types";

type APIButtonProps = {
  id: string;
  action: string;
  method?: "get" | "post";
  disabled?: boolean;
  /** Posted so the API can render this exact control back into the page. */
  variant?: string;
  buttonText: ChildType;
  hiddenInput?: { name: string; value: boolean };
  isDisabled?: boolean;
  /** Filled primary style (e.g. follow button when already following). */
  isActive?: boolean;
  shouldRefreshFollowedCreators?: boolean;
  shouldRefreshCreatorPosts?: boolean;
};

const APIButton = ({
  id,
  action,
  method = "post",
  variant,
  buttonText,
  hiddenInput,
  isDisabled = false,
  isActive = false,
  shouldRefreshFollowedCreators = false,
  shouldRefreshCreatorPosts = false,
}: APIButtonProps) => {
  const alpineAttrs = {
    "x-data": "{ isSubmitting: false }",
    "@ajax:before": "isSubmitting = true",
    "@ajax:after": "$dispatch('dialog:open'); isSubmitting = false",
    "@ajax:error": "isSubmitting = false",
    // `modal-root` belongs only on the 401 target: alpine-ajax removes a
    // targeted element that a 2xx response omits, so listing it here deleted
    // the page's modal container on every successful action.
    "x-target": `${id} toast`,
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
        "whitespace-nowrap w-full rounded-radius border px-4 py-2 text-sm font-medium tracking-wide transition hover:opacity-75 text-center",
        isActive
          ? "bg-on-surface-strong text-on-primary border-on-surface-strong"
          : "bg-transparent text-secondary",
        isDisabled
          ? isActive
            ? "border-on-surface-strong/50 opacity-50"
            : "border-secondary/50"
          : !isActive && "border-secondary",
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
        class="flex cursor-pointer items-center justify-center gap-2 hover:cursor-pointer w-full disabled:opacity-50 hover:opacity-75"
        disabled={isDisabled}
      >
        {buttonText}
      </button>
    </form>
  );
};

export default APIButton;
