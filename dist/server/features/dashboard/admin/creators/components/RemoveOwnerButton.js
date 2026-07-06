import { jsx } from "hono/jsx/jsx-runtime";
import { deleteIcon } from "../../../../../lib/icons.js";
const RemoveOwnerButton = ({ creatorId }) => {
  const alpineAttrs = {
    "x-init": "true",
    "x-target": `creator-owner-${creatorId}`,
    "@ajax:before": "confirm('Are you sure?') || $event.preventDefault()"
  };
  return /* @__PURE__ */ jsx(
    "form",
    {
      method: "post",
      action: `/dashboard/admin/creators/${creatorId}/remove-owner`,
      ...alpineAttrs,
      children: /* @__PURE__ */ jsx("button", { type: "submit", class: "cursor-pointer hover:text-red-500", children: deleteIcon })
    }
  );
};
var RemoveOwnerButton_default = RemoveOwnerButton;
export {
  RemoveOwnerButton_default as default
};
