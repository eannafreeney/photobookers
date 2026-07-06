import { jsx, jsxs } from "hono/jsx/jsx-runtime";
const APIButtonCircle = ({
  id,
  action,
  method = "post",
  hiddenInput,
  buttonText,
  buttonType,
  isDisabled = false,
  tooltipText = "",
  shouldRefreshFollowedCreators = false,
  shouldRefreshCreatorMessages = false
}) => {
  const attrs = {
    "x-data": "{ isSubmitting: false }",
    "@ajax:before": "isSubmitting = true",
    "@ajax:after": "$dispatch('dialog:open'); isSubmitting = false;",
    "@ajax:error": "isSubmitting = false",
    "x-target": `${id} modal-root`,
    "x-target.error": "modal-root",
    "x-target.401": "modal-root"
  };
  return /* @__PURE__ */ jsxs(
    "form",
    {
      id,
      method,
      action,
      class: "inline-flex justify-center items-center aspect-square whitespace-nowrap size-8 rounded-full bg-gray-200 p-1 text-sm font-medium tracking-wide text-on-surface-dark transition hover:opacity-75 text-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-surface-dark active:opacity-100 active:outline-offset-0 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer",
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
