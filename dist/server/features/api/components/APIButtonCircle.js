import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import clsx from "clsx";
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
  shouldRefreshCreatorPosts = false
}) => {
  const attrs = {
    "x-data": "{ isSubmitting: false }",
    "@ajax:before": "isSubmitting = true",
    "@ajax:after": "$dispatch('dialog:open'); isSubmitting = false;",
    "@ajax:error": "isSubmitting = false",
    // See APIButton: only the 401 response carries `modal-root`.
    "x-target": id,
    "x-target.error": "toast",
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
        "inline-flex justify-center items-center aspect-square whitespace-nowrap size-8 rounded-full p-1 text-sm font-medium tracking-wide transition hover:opacity-75 text-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-surface-dark active:opacity-100 active:outline-offset-0 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer",
        isActive ? "bg-on-surface-strong text-on-primary" : "bg-gray-200 text-on-surface-dark"
      ),
      ...attrs,
      children: [
        hiddenInput?.value !== void 0 && /* @__PURE__ */ jsx(
          "input",
          {
            type: "hidden",
            name: hiddenInput.name,
            value: hiddenInput.value ? "true" : "false"
          }
        ),
        buttonType && /* @__PURE__ */ jsx("input", { type: "hidden", name: "buttonType", value: buttonType }),
        variant && /* @__PURE__ */ jsx("input", { type: "hidden", name: "variant", value: variant }),
        shouldRefreshFollowedCreators && /* @__PURE__ */ jsx(
          "input",
          {
            type: "hidden",
            name: "shouldRefreshFollowedCreators",
            value: "true"
          }
        ),
        shouldRefreshCreatorPosts && /* @__PURE__ */ jsx("input", { type: "hidden", name: "shouldRefreshCreatorPosts", value: "true" }),
        /* @__PURE__ */ jsx(
          "button",
          {
            class: "cursor-pointer disabled:opacity-30",
            disabled: isDisabled,
            title: tooltipText,
            children: buttonText
          }
        )
      ]
    }
  );
};
var APIButtonCircle_default = APIButtonCircle;
export {
  APIButtonCircle_default as default
};
