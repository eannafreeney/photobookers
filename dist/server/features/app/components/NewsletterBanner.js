import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Button from "../../../components/app/Button.js";
import { NEWSLETTER_COPY } from "../../../constants/newsletter.js";
const NewsletterBanner = () => {
  return /* @__PURE__ */ jsx(
    "div",
    {
      class: "hidden md:block",
      "x-data": "{ showBanner: $persist(true).as('newsletter-banner'), dismiss() { this.showBanner = false } }",
      children: /* @__PURE__ */ jsx(
        "div",
        {
          "x-show": "showBanner",
          "x-transition:leave": "transition ease-in duration-300",
          "x-transition:leave-start": "opacity-100",
          "x-transition:leave-end": "opacity-0",
          class: "relative flex min-h-12 items-center bg-on-surface-strong py-3 text-surface",
          children: /* @__PURE__ */ jsxs("div", { class: "mx-auto flex items-center justify-center gap-4 px-6", children: [
            /* @__PURE__ */ jsxs("p", { class: "text-sm text-pretty", children: [
              /* @__PURE__ */ jsx("span", { class: "kicker text-[#d9a59a] mr-2 hidden sm:inline", children: NEWSLETTER_COPY.kicker }),
              NEWSLETTER_COPY.banner
            ] }),
            /* @__PURE__ */ jsx("a", { href: "/newsletter", class: "inline-block", children: /* @__PURE__ */ jsx(Button, { variant: "solid", color: "accent", width: "auto", children: NEWSLETTER_COPY.cta }) }),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                "x-on:click": "dismiss()",
                class: "cursor-pointer hover:opacity-75",
                children: "\u2715"
              }
            )
          ] })
        }
      )
    }
  );
};
var NewsletterBanner_default = NewsletterBanner;
export {
  NewsletterBanner_default as default
};
