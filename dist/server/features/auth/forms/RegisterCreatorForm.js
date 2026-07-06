import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import Link from "../../../components/app/Link.js";
import Checkbox from "../../../components/forms/Checkbox.js";
import FormButton from "../../../components/forms/FormButtons.js";
import Input from "../../../components/forms/Input.js";
import ValidateDisplayName from "../components/ValidateDisplayName.js";
import ValidateEmail from "../components/ValidateEmail.js";
import ValidateWebsite from "../components/ValidateWebsite.js";
const RegisterCreatorForm = ({ type }) => {
  const alpineAttrs = {
    "x-data": "registerCreatorForm()",
    "x-on:submit": "submitForm($event)",
    "x-target": "register-form toast",
    "x-on:ajax:error": "isSubmitting = false",
    "x-on:email-availability.window": "emailIsTaken = !$event.detail.emailIsAvailable",
    "x-on:displayName-availability.window": "displayNameIsTaken = !$event.detail.displayNameIsAvailable",
    "x-on:website-availability.window": "websiteIsTaken = !$event.detail.websiteIsAvailable",
    "x-on:turnstile:success.window": "setCaptchaToken($event.detail.token)",
    "x-on:turnstile:expired.window": "clearCaptchaToken()"
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(
      "form",
      {
        action: "/auth/register-creator",
        method: "post",
        ...alpineAttrs,
        class: "flex flex-col gap-2",
        children: [
          /* @__PURE__ */ jsx(ValidateDisplayName, {}),
          /* @__PURE__ */ jsx(ValidateWebsite, {}),
          /* @__PURE__ */ jsx(ValidateEmail, {}),
          /* @__PURE__ */ jsx(
            Input,
            {
              type: "password",
              label: "Password",
              name: "form.password",
              validateInput: "validatePassword()",
              placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
              required: true
            }
          ),
          /* @__PURE__ */ jsx(
            Input,
            {
              type: "password",
              label: "Confirm Password",
              name: "form.confirmPassword",
              validateInput: "validateConfirmPassword()",
              placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
              required: true
            }
          ),
          /* @__PURE__ */ jsx("div", { class: "my-4", children: /* @__PURE__ */ jsx(
            Checkbox,
            {
              label: "I agree to the terms and conditions",
              name: "form.agreeToTerms",
              required: true
            }
          ) }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "hidden",
              name: "type",
              value: type,
              "x-init": `form.type = '${type}'`
            }
          ),
          /* @__PURE__ */ jsx("input", { type: "hidden", name: "captchaToken", "x-model": "form.captchaToken" }),
          /* @__PURE__ */ jsx(
            "div",
            {
              class: "cf-turnstile my-4",
              "data-theme": "light",
              "data-size": "flexible",
              "data-sitekey": process.env.TURNSTILE_SITE_KEY,
              "data-callback": "onTurnstileSuccess",
              "data-expired-callback": "onTurnstileExpired"
            }
          ),
          /* @__PURE__ */ jsx(FormButton, { buttonText: "Create Account", loadingText: "Submitting..." })
        ]
      }
    ),
    /* @__PURE__ */ jsxs("p", { class: "text-center text-sm mt-4", children: [
      "Already have an account?",
      " ",
      /* @__PURE__ */ jsx(Link, { href: "/auth/login", children: /* @__PURE__ */ jsx("span", { class: "font-semibold", children: "Sign In" }) })
    ] })
  ] });
};
var RegisterCreatorForm_default = RegisterCreatorForm;
export {
  RegisterCreatorForm_default as default
};
