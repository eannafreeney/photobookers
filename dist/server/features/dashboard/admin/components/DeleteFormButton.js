import { jsx } from "hono/jsx/jsx-runtime";
import { deleteIcon } from "../../../../lib/icons.js";
const DeleteFormButton = ({ action }) => {
  const alpineAttrs = {
    "x-init": "true",
    "x-target": "toast",
    "@ajax:before": "confirm('Are you sure?') || $event.preventDefault()"
  };
  return /* @__PURE__ */ jsx("form", { method: "post", action, ...alpineAttrs, children: /* @__PURE__ */ jsx("button", { type: "submit", class: "cursor-pointer hover:text-red-500", children: deleteIcon }) });
};
var DeleteFormButton_default = DeleteFormButton;
export {
  DeleteFormButton_default as default
};
