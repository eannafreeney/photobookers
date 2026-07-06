import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import AppLayout from "../../../components/layouts/AppLayout.js";
import Page from "../../../components/layouts/Page.js";
import Link from "../../../components/app/Link.js";
import Button from "../../../components/app/Button.js";
import Checkbox from "../../../components/forms/Checkbox.js";
import FormButton from "../../../components/forms/FormButtons.js";
import Input from "../../../components/forms/Input.js";
import ValidateEmail from "../../auth/components/ValidateEmail.js";
const claimStartPath = (creatorId) => `/claims/${creatorId}/start`;
const ClaimStartPage = ({ creatorId, creator, user, flash }) => {
  const loginHref = `/auth/login?redirectUrl=${encodeURIComponent(claimStartPath(creatorId))}`;
  return /* @__PURE__ */ jsx(
    AppLayout,
    {
      title: "Claim this creator profile",
      user,
      currentPath: claimStartPath(creatorId),
      flash: flash ?? void 0,
      children: /* @__PURE__ */ jsx(Page, { children: user ? /* @__PURE__ */ jsx(
        LoggedInClaimForm,
        {
          creatorId,
          user,
          creatorWebsite: creator.website ?? ""
        }
      ) : /* @__PURE__ */ jsx(
        LoggedOutSignupForm,
        {
          creatorId,
          creatorWebsite: creator.website ?? null,
          loginHref
        }
      ) })
    }
  );
};
var ClaimStartPage_default = ClaimStartPage;
const LoggedInClaimForm = ({
  creatorId,
  user,
  creatorWebsite
}) => /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-4", children: [
  /* @__PURE__ */ jsx("h1", { class: "font-display text-3xl font-medium text-on-surface-strong", children: "Claim creator profile" }),
  /* @__PURE__ */ jsxs(
    "form",
    {
      method: "post",
      action: claimStartPath(creatorId),
      "x-data": `claimForm(${JSON.stringify({ creatorWebsite: creatorWebsite || null })})`,
      "x-on:submit": "submitForm($event)",
      children: [
        /* @__PURE__ */ jsx("div", { class: "flex flex-col gap-3 mb-4", children: creatorWebsite ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs("p", { class: "text-sm text-gray-600", children: [
            "This creator has ",
            /* @__PURE__ */ jsx("strong", { children: creatorWebsite }),
            " on file. If your account email (",
            /* @__PURE__ */ jsx("strong", { children: user.email }),
            ") is at the same domain, you'll be approved instantly. Otherwise, your claim will be reviewed by our team."
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "hidden",
              name: "form.verificationUrl",
              value: creatorWebsite
            }
          )
        ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("p", { class: "text-sm text-gray-600", children: "This creator doesn't have a website on file. Please provide their website URL. Your claim will then be reviewed by our team." }),
          /* @__PURE__ */ jsx(
            Input,
            {
              label: "Creator's Website URL",
              name: "form.verificationUrl",
              type: "url",
              placeholder: "https://yourwebsite.com",
              required: true
            }
          )
        ] }) }),
        /* @__PURE__ */ jsx("input", { type: "hidden", name: "email", value: user.email }),
        /* @__PURE__ */ jsx(Button, { variant: "solid", color: "primary", children: "Submit claim" })
      ]
    }
  )
] });
const LoggedOutSignupForm = ({
  creatorId,
  creatorWebsite,
  loginHref
}) => {
  const alpineAttrs = {
    "x-data": "claimSignupForm()",
    "@submit": "submitForm($event)",
    "@email-availability.window": "emailIsTaken = !$event.detail.emailIsAvailable",
    "@turnstile:success.window": "setCaptchaToken($event.detail.token)",
    "@turnstile:expired.window": "clearCaptchaToken()"
  };
  return /* @__PURE__ */ jsxs("div", { id: "register-form", class: "flex flex-col gap-2", children: [
    /* @__PURE__ */ jsx("h1", { class: "font-display text-3xl font-medium text-on-surface-strong mb-2", children: "Claim this creator profile" }),
    /* @__PURE__ */ jsxs("p", { class: "text-sm text-gray-600 mb-2", children: [
      "Already have an account?",
      " ",
      /* @__PURE__ */ jsx(Link, { href: loginHref, children: /* @__PURE__ */ jsx("span", { class: "font-semibold", children: "Log in" }) })
    ] }),
    /* @__PURE__ */ jsxs(
      "form",
      {
        method: "post",
        action: `${claimStartPath(creatorId)}/signup`,
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
  ] });
};
export {
  ClaimStartPage_default as default
};
