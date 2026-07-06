import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Button from "../../../../../components/app/Button.js";
import CreatorsComboBox from "../components/CreatorsComboBox.js";
const AssignOwnerForm = ({ users, creatorId }) => {
  const alpineAttrs = {
    "x-target": "toast",
    "x-on:ajax:after": "$dispatch('dialog:close'), $dispatch('creators:updated')"
  };
  return /* @__PURE__ */ jsxs(
    "form",
    {
      ...alpineAttrs,
      method: "post",
      action: `/dashboard/admin/creators/assign-owner/${creatorId}`,
      class: "w-full flex flex-col gap-4",
      children: [
        /* @__PURE__ */ jsx(CreatorsComboBox, { users }),
        /* @__PURE__ */ jsx(Button, { variant: "solid", color: "primary", children: "Assign" })
      ]
    }
  );
};
var AssignOwnerForm_default = AssignOwnerForm;
export {
  AssignOwnerForm_default as default
};
