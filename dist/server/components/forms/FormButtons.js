import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { loadingIcon } from "../../lib/icons.js";
import Button from "../app/Button.js";
const FormButtons = ({
  buttonText = "Save",
  loadingText = "Saving...",
  showCancelButton = false,
  isDisabled = false
}) => {
  return /* @__PURE__ */ jsxs("div", { class: "flex items-center gap-4 mt-4", children: [
    showCancelButton && /* @__PURE__ */ jsx(
      Button,
      {
        variant: "outline",
        type: "button",
        color: "inverse",
        "x-on:click": "$dispatch('dialog:close')",
        children: "Cancel"
      }
    ),
    /* @__PURE__ */ jsx(
      Button,
      {
        variant: "solid",
        color: "primary",
        isDisabled,
        "x-bind:disabled": "isSubmitting || !isFormValid",
        children: /* @__PURE__ */ jsxs("div", { class: "flex items-center justify-center gap-2", children: [
          /* @__PURE__ */ jsx("span", { "x-show": "!isSubmitting", children: buttonText }),
          /* @__PURE__ */ jsxs(
            "span",
            {
              "x-show": "isSubmitting",
              class: "flex items-center justify-center gap-2",
              children: [
                loadingText,
                " ",
                loadingIcon
              ]
            }
          )
        ] })
      }
    )
  ] });
};
var FormButtons_default = FormButtons;
export {
  FormButtons_default as default
};
