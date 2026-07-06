import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import clsx from "clsx";
const APIButton = ({
  id,
  action,
  method = "post",
  buttonText,
  hiddenInput,
  isDisabled = false,
  isActive = false,
  shouldRefreshFollowedCreators = false,
  shouldRefreshCreatorMessages = false
}) => {
  const alpineAttrs = {
    "x-data": "{ isSubmitting: false }",
    "@ajax:before": "isSubmitting = true",
    "@ajax:after": "$dispatch('dialog:open'); isSubmitting = false",
    "@ajax:error": "isSubmitting = false",
    "x-target": `${id} toast modal-root`,
    "x-target.error": "toast modal-root",
    "x-target.401": "modal-root"
  };
  return /* @__PURE__ */ jsxs(
    "form",
    {
      id,
      "x-sync": true,
      method,
      action,
      class: clsx(
        "whitespace-nowrap w-full rounded-radius border px-4 py-2 text-sm font-medium tracking-wide transition hover:opacity-75 text-center",
        isActive ? "bg-on-surface-strong text-on-primary border-on-surface-strong" : "bg-transparent text-secondary",
        isDisabled ? isActive ? "border-on-surface-strong/50 opacity-50" : "border-secondary/50" : !isActive && "border-secondary"
      ),
      ...alpineAttrs,
      children: [
        hiddenInput?.value !== void 0 && /* @__PURE__ */ jsx(
          "input",
          {
            type: "hidden",
            name: hiddenInput.name,
            value: hiddenInput.value ? "true" : "false"
          }
        ),
        shouldRefreshFollowedCreators && /* @__PURE__ */ jsx(
          "input",
          {
            type: "hidden",
            name: "shouldRefreshFollowedCreators",
            value: "true"
          }
        ),
        shouldRefreshCreatorMessages && /* @__PURE__ */ jsx("input", { type: "hidden", name: "shouldRefreshCreatorMessages", value: "true" }),
        /* @__PURE__ */ jsx(
          "button",
          {
            class: "flex cursor-pointer items-center justify-center gap-2 hover:cursor-pointer w-full disabled:opacity-50 hover:opacity-75",
            disabled: isDisabled,
            children: buttonText
          }
        )
      ]
    }
  );
};
var APIButton_default = APIButton;
export {
  APIButton_default as default
};
