import { jsx } from "hono/jsx/jsx-runtime";
import Button from "../../../../../components/app/Button.js";
import FormPost from "../../../../../components/forms/FormPost.js";
const ResetUserPasswordButton = ({ userId }) => {
  const alpineAttrs = {
    "x-target": "modal-root toast",
    "x-target.error": "toast",
    "@ajax:before": "confirm('Generate a new temporary password? The user must change it on next login.') || $event.preventDefault()"
  };
  return /* @__PURE__ */ jsx(
    FormPost,
    {
      action: `/dashboard/admin/users/${userId}/reset-password`,
      ...alpineAttrs,
      children: /* @__PURE__ */ jsx(Button, { variant: "outline", color: "warning", type: "submit", width: "auto", children: "Reset password" })
    }
  );
};
var ResetUserPasswordButton_default = ResetUserPasswordButton;
export {
  ResetUserPasswordButton_default as default
};
