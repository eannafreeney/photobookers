import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import Link from "../../../components/app/Link.js";
import FormButton from "../../../components/forms/FormButtons.js";
import Input from "../../../components/forms/Input.js";
const LoginForm = ({ redirectUrl }) => {
  const alpineAttrs = {
    "x-data": "loginForm()",
    "x-on:submit": "submitForm($event)",
    "x-target.away": "_top",
    "x-target": "toast",
    "x-on:ajax:error": "isSubmitting = false"
  };
  const action = redirectUrl ? `/auth/login?redirectUrl=${encodeURIComponent(redirectUrl)}` : `/auth/login`;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(
      "form",
      {
        action,
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
            Input,
            {
              label: "Password",
              name: "form.password",
              validateInput: "validateField('password')",
              type: "password",
              placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
              validationTrigger: "blur",
              required: true,
              showPasswordToggle: true,
              ...{ "x-bind:type": "inputType" }
            }
          ),
          /* @__PURE__ */ jsx("div", { class: "flex justify-end", children: /* @__PURE__ */ jsx(Link, { href: "/auth/forgot-password", children: /* @__PURE__ */ jsx("span", { class: "text-sm font-semibold", children: "Forgot password?" }) }) }),
          /* @__PURE__ */ jsx(FormButton, { buttonText: "Log In", loadingText: "Logging in..." })
        ]
      }
    ),
    /* @__PURE__ */ jsxs("p", { class: "text-center text-sm mt-4", children: [
      "Don't have an account?",
      " ",
      /* @__PURE__ */ jsx(Link, { href: "/auth/accounts", children: /* @__PURE__ */ jsx("span", { class: "font-semibold", children: "Register" }) })
    ] })
  ] });
};
var LoginForm_default = LoginForm;
export {
  LoginForm_default as default
};
