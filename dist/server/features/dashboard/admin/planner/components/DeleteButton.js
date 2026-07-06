import { jsx } from "hono/jsx/jsx-runtime";
import FormDelete from "../../../../../components/forms/FormDelete.js";
import { deleteIcon } from "../../../../../lib/icons.js";
const DeleteButton = ({ action }) => {
  const alpineAttrs = {
    "x-target": "toast",
    "x-on:ajax:success": "$dispatch('dialog:close'), $dispatch('planner:updated')",
    "@ajax:before": "confirm('Are you sure?') || $event.preventDefault()"
  };
  return /* @__PURE__ */ jsx(
    FormDelete,
    {
      action,
      ...alpineAttrs,
      class: "inline-block text-sm font-medium text-danger hover:underline",
      children: /* @__PURE__ */ jsx("button", { type: "submit", children: deleteIcon })
    }
  );
};
var DeleteButton_default = DeleteButton;
export {
  DeleteButton_default as default
};
