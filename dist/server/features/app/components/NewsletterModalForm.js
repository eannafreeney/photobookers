import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Button from "../../../components/app/Button.js";
import { getInputIcon } from "../../../utils.js";
const NewsletterModalForm = () => {
  const alpineAttrs = {
    "x-target": "toast",
    "x-target.error": "toast",
    "x-target.401": "modal-root",
    "@ajax:after": "$el.reset(), $dispatch('dialog:close')"
  };
  return /* @__PURE__ */ jsxs(
    "form",
    {
      action: "/api/newsletter",
      method: "post",
      class: "flex flex-col gap-3",
      ...alpineAttrs,
      children: [
        /* @__PURE__ */ jsxs("label", { class: "bg-surface-alt rounded-radius border border-outline text-on-surface-alt flex items-center gap-2 px-2 py-2 font-semibold focus-within:outline focus-within:outline-offset-2 focus-within:outline-primary w-full sm:w-auto", children: [
          getInputIcon("email"),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "email",
              class: "w-full bg-surface-alt px-1 py-0.5 text-base md:text-sm font-normal focus:outline-none disabled:cursor-not-allowed disabled:opacity-75",
              name: "email",
              placeholder: "you@example.com",
              autocomplete: "email",
              required: true
            }
          )
        ] }),
        /* @__PURE__ */ jsx(Button, { variant: "solid", color: "warning", width: "full", children: "Sign up" })
      ]
    }
  );
};
var NewsletterModalForm_default = NewsletterModalForm;
export {
  NewsletterModalForm_default as default
};
