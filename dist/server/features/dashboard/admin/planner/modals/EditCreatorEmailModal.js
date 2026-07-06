import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import Button from "../../../../../components/app/Button.js";
import Input from "../../../../../components/forms/Input.js";
const EditCreatorEmailModal = ({ creatorId, displayName, email }) => {
  const hasEmail = Boolean(email?.trim());
  const alpineAttrs = {
    "x-target": `creator-email-${creatorId} toast modal-root`,
    "x-target.error": "toast",
    "x-on:ajax:success": "$dispatch('dialog:close')"
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("p", { class: "text-sm text-on-surface", children: hasEmail ? `Update the email for ${displayName}.` : `Add an email for ${displayName} so spotlight notifications can be sent.` }),
    /* @__PURE__ */ jsxs(
      "form",
      {
        method: "post",
        action: `/dashboard/admin/planner/creators/${creatorId}/edit-email`,
        class: "flex flex-col gap-3",
        "x-data": `{ 'form.email': ${JSON.stringify(email ?? "")} }`,
        ...alpineAttrs,
        children: [
          /* @__PURE__ */ jsx(
            Input,
            {
              label: "Email",
              type: "email",
              name: "form.email",
              required: true,
              autofocus: true
            }
          ),
          /* @__PURE__ */ jsx(Button, { variant: "solid", color: "primary", children: "Save email" })
        ]
      }
    )
  ] });
};
var EditCreatorEmailModal_default = EditCreatorEmailModal;
export {
  EditCreatorEmailModal_default as default
};
