import { jsx } from "hono/jsx/jsx-runtime";
import Button from "../../../../components/app/Button.js";
import FormDelete from "../../../../components/forms/FormDelete.js";
const DeleteMessageForm = ({ creatorId, messageId }) => {
  const alpineAttrs = {
    "x-target": "toast messages-table-body",
    "@ajax:before": "confirm('Delete this post?') || $event.preventDefault()",
    "@ajax:success": "$dispatch('messages:updated')"
  };
  return /* @__PURE__ */ jsx(
    FormDelete,
    {
      action: `/dashboard/messages/${creatorId}/${messageId}`,
      ...alpineAttrs,
      children: /* @__PURE__ */ jsx(Button, { variant: "outline", color: "danger", children: /* @__PURE__ */ jsx("span", { children: "Delete" }) })
    }
  );
};
var DeleteMessageForm_default = DeleteMessageForm;
export {
  DeleteMessageForm_default as default
};
