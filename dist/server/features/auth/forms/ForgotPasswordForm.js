import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import Link from "../../../components/app/Link.js";
import FormButton from "../../../components/forms/FormButtons.js";
import Input from "../../../components/forms/Input.js";
const ForgotPasswordForm = () => {
  const alpineAttrs = {
    "x-data": "forgotPasswordForm()",
    "x-on:submit": "submitForm($event)",
    "x-target": "forgot-password-form toast",
    "x-target.error": "toast",
    "x-on:ajax:error": "isSubmitting = false"
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(
      "form",
      {
        id: "forgot-password-form",
        action: "/auth/forgot-password",
        method: "post",
        ...alpineAttrs,
        class: "flex flex-col gap-2",
        children: [
          /* @__PURE__ */ jsx(
            Input,
            {
              label: "Email",
              name: "form.email",
              validateInput: "validateField('email')",
              type: "email",
              placeholder: "you@example.com",
              validationTrigger: "blur",
              required: true
            }
          ),
          /* @__PURE__ */ jsx(
            FormButton,
            {
              buttonText: "Send reset link",
              loadingText: "Sending..."
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsxs("p", { class: "text-center text-sm mt-4", children: [
      "Remember your password?",
      " ",
      /* @__PURE__ */ jsx(Link, { href: "/auth/login", children: /* @__PURE__ */ jsx("span", { class: "font-semibold", children: "Back to sign in" }) })
    ] })
  ] });
};
var ForgotPasswordForm_default = ForgotPasswordForm;
export {
  ForgotPasswordForm_default as default
};
