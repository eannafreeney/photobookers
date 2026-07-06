import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Link from "../../../components/app/Link.js";
import Checkbox from "../../../components/forms/Checkbox.js";
import FormButton from "../../../components/forms/FormButtons.js";
import Input from "../../../components/forms/Input.js";
import ValidateEmail from "../../auth/components/ValidateEmail.js";
const ClaimSignupModal = ({
  creatorId,
  creatorWebsite,
  currentPath
}) => {
  const alpineAttrs = {
    "x-data": "claimSignupForm()",
    "x-on:submit": "submitForm($event)",
    "x-target": "toast",
    "x-on:ajax:error": "isSubmitting = false",
    "x-on:ajax:after": "$dispatch('dialog:close')",
    "x-on:email-availability.window": "emailIsTaken = !$event.detail.emailIsAvailable",
    "x-on:turnstile:success.window": "setCaptchaToken($event.detail.token)",
    "x-on:turnstile:expired.window": "clearCaptchaToken()"
  };
  const loginHref = currentPath ? `/auth/login?redirectUrl=${encodeURIComponent(`/claims/${creatorId}?currentPath=${encodeURIComponent(currentPath ?? "")}`)}` : `/auth/login?redirectUrl=${encodeURIComponent(`/claims/${creatorId}`)}`;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      id: "register-form",
      class: "flex flex-col gap-2 p-2 max-h-[70vh] overflow-y-auto",
      children: [
        /* @__PURE__ */ jsxs("p", { class: "text-sm text-gray-600 mb-2", children: [
          "Already have an account?",
          " ",
          /* @__PURE__ */ jsx(Link, { href: loginHref, children: /* @__PURE__ */ jsx("span", { class: "font-semibold", children: "Log in" }) })
        ] }),
        /* @__PURE__ */ jsxs(
          "form",
          {
            method: "post",
            action: `/claims/${creatorId}/register-and-claim`,
            ...alpineAttrs,
            children: [
              /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-3 mb-2", children: [
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    label: "First Name",
                    name: "form.firstName",
                    placeholder: "Your first name",
                    validateInput: "validateField('firstName')",
                    required: true
                  }
                ),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    label: "Last Name",
                    name: "form.lastName",
                    placeholder: "Your last name",
                    validateInput: "validateField('lastName')",
                    required: true
                  }
                ),
                /* @__PURE__ */ jsx(ValidateEmail, {}),
                creatorWebsite ? /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "hidden",
                    name: "verificationUrl",
                    value: creatorWebsite
                  }
                ) : /* @__PURE__ */ jsx(
                  Input,
                  {
                    label: "Website",
                    name: "form.verificationUrl",
                    type: "url",
                    placeholder: "https://yourwebsite.com",
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
                ) })
              ] }),
              /* @__PURE__ */ jsx("input", { type: "hidden", name: "type", value: "fan" }),
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
              /* @__PURE__ */ jsx(
                FormButton,
                {
                  buttonText: "Create account & submit claim",
                  loadingText: "Submitting..."
                }
              ),
              /* @__PURE__ */ jsx(
                "p",
                {
                  "x-show": "errors.globalError",
                  class: "text-red-500",
                  "x-text": "errors.globalError"
                }
              )
            ]
          }
        )
      ]
    }
  );
};
var ClaimSignUpModal_default = ClaimSignupModal;
export {
  ClaimSignUpModal_default as default
};
