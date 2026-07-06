import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import Button from "../../../components/app/Button.js";
import Input from "../../../components/forms/Input.js";
const ClaimModal = ({ creatorId, user, creatorWebsite }) => {
  const alpineAttrs = {
    "x-data": `claimForm(${JSON.stringify({ creatorWebsite: creatorWebsite ?? null })})`,
    "x-target": `toast`,
    "x-on:submit": "submitForm($event)",
    "x-on:ajax:after": "$dispatch('dialog:close')"
  };
  return /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-4 p-2", children: [
    /* @__PURE__ */ jsx("h2", { class: "font-display text-3xl font-medium text-on-surface-strong", children: "Claim Creator Profile" }),
    /* @__PURE__ */ jsxs("form", { method: "post", action: `/claims/${creatorId}`, ...alpineAttrs, children: [
      /* @__PURE__ */ jsx("div", { class: "flex flex-col gap-3 mb-4", children: creatorWebsite ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("p", { class: "text-sm text-gray-600", children: [
          "This creator has ",
          /* @__PURE__ */ jsx("strong", { children: creatorWebsite }),
          " on file.",
          ` `,
          `If your account email (`,
          /* @__PURE__ */ jsx("strong", { children: user.email }),
          `) is at the same domain, you'll be approved instantly. Otherwise, your claim will be reviewed by our team.`
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
      /* @__PURE__ */ jsx("input", { type: "hidden", name: "email", value: user?.email }),
      /* @__PURE__ */ jsx(Button, { variant: "solid", color: "primary", children: "Submit Claim" })
    ] })
  ] });
};
var ClaimModal_default = ClaimModal;
export {
  ClaimModal_default as default
};
