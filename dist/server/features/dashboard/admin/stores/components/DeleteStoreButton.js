import { jsx } from "hono/jsx/jsx-runtime";
import Button from "../../../../../components/app/Button.js";
import FormDelete from "../../../../../components/forms/FormDelete.js";
const DeleteStoreButton = ({ store }) => {
  const alpineAttrs = {
    "x-target": "toast",
    "@ajax:before": "confirm('Are you sure?') || $event.preventDefault()",
    "@ajax.success": "$dispatch('stores:updated'), $el.closest('tr').remove()"
  };
  return /* @__PURE__ */ jsx(FormDelete, { action: `/dashboard/admin/stores/${store.id}`, ...alpineAttrs, children: /* @__PURE__ */ jsx(Button, { variant: "outline", color: "danger", children: /* @__PURE__ */ jsx("span", { children: "Delete" }) }) });
};
var DeleteStoreButton_default = DeleteStoreButton;
export {
  DeleteStoreButton_default as default
};
