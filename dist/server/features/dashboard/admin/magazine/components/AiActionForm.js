import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Button from "../../../../../components/app/Button.js";
import FormPost from "../../../../../components/forms/FormPost.js";
import { loadingIcon } from "../../../../../lib/icons.js";
const AiActionForm = ({
  action,
  bookId,
  targetId,
  label,
  busyLabel
}) => {
  const alpineAttrs = {
    "x-data": "{ busy: false }",
    "x-target": `${targetId} toast`,
    "@ajax:before": "busy = true",
    "@ajax:after": "busy = false"
  };
  return /* @__PURE__ */ jsxs(FormPost, { action, ...alpineAttrs, className: "w-full", children: [
    /* @__PURE__ */ jsx("input", { type: "hidden", name: "bookId", value: bookId }),
    /* @__PURE__ */ jsxs(
      Button,
      {
        variant: "outline",
        color: "primary",
        width: "full",
        "x-bind:disabled": "busy",
        children: [
          /* @__PURE__ */ jsx("span", { "x-show": "!busy", children: label }),
          /* @__PURE__ */ jsxs(
            "span",
            {
              "x-show": "busy",
              class: "inline-flex items-center justify-center gap-1",
              children: [
                busyLabel,
                " ",
                loadingIcon
              ]
            }
          )
        ]
      }
    )
  ] });
};
var AiActionForm_default = AiActionForm;
export {
  AiActionForm_default as default
};
