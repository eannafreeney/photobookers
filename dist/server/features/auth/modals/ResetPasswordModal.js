import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Modal from "../../../components/app/Modal.js";
import ResetPasswordForm from "../forms/SetPasswordForm.js";
const ResetPasswordModal = () => {
  const alpineAttrs = {
    "x-data": "resetPasswordForm()",
    "x-target": "toast",
    "x-on:submit": "submitForm($event)",
    "x-on:ajax:after": "$dispatch('dialog:close')",
    "x-on:ajax:error": "isSubmitting = false"
  };
  return /* @__PURE__ */ jsx(Modal, { title: "Reset Password", children: /* @__PURE__ */ jsxs(
    "form",
    {
      action: "/auth/reset-password",
      method: "post",
      ...alpineAttrs,
      class: "flex flex-col gap-4",
      children: [
        /* @__PURE__ */ jsx("input", { type: "hidden", name: "isModal", value: "true" }),
        /* @__PURE__ */ jsx(
          ResetPasswordForm,
          {
            buttonText: "Reset Password",
            loadingText: "Resetting..."
          }
        )
      ]
    }
  ) });
};
var ResetPasswordModal_default = ResetPasswordModal;
export {
  ResetPasswordModal_default as default
};
