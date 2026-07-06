import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { loadingIcon } from "../../lib/icons.js";
import Button from "./Button.js";
const FormButton = ({
  action,
  buttonText,
  variant,
  color,
  loadingText = "Submitting..."
}) => {
  const alpineAttrs = {
    "x-data": "{ isSubmitting: false }",
    "@ajax:before": "isSubmitting = true",
    "@ajax:after": "$dispatch('dialog:close'); isSubmitting = false",
    "@ajax:error": "isSubmitting = false",
    "x-target": "toast"
  };
  return /* @__PURE__ */ jsx("form", { method: "post", action, ...alpineAttrs, children: /* @__PURE__ */ jsx(Button, { variant, color, type: "submit", children: /* @__PURE__ */ jsxs("div", { class: "flex items-center justify-center gap-2", children: [
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
  ] }) }) });
};
var FormButton_default = FormButton;
export {
  FormButton_default as default
};
