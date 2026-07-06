import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Button from "../../../components/app/Button.js";
import { getInputIcon } from "../../../utils.js";
import clsx from "clsx";
const NewsletterForm = ({ className }) => /* @__PURE__ */ jsxs(
  "form",
  {
    id: "newsletter-form",
    "x-target": "toast",
    ...{ "x-target.error": "toast", "@ajax:after": "$el.reset()" },
    action: "/api/newsletter",
    method: "post",
    class: clsx("flex w-full min-w-0 items-center gap-2", className),
    children: [
      /* @__PURE__ */ jsxs("label", { class: "flex h-10 min-w-0 flex-1 items-center gap-2 rounded-radius border border-outline bg-surface px-3 font-semibold text-on-surface-alt shadow-sm focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary", children: [
        /* @__PURE__ */ jsx("span", { class: "shrink-0", children: getInputIcon("email") }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "email",
            class: "min-w-0 flex-1 bg-surface text-sm leading-none focus:outline-none disabled:cursor-not-allowed disabled:opacity-75",
            name: "email",
            placeholder: "you@example.com",
            autocomplete: "email",
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { class: "h-10 shrink-0 [&>button]:h-full [&>button]:px-4", children: /* @__PURE__ */ jsx(Button, { variant: "solid", color: "primary", width: "auto", children: "Sign up" }) })
    ]
  }
);
var NewsletterForm_default = NewsletterForm;
export {
  NewsletterForm_default as default
};
