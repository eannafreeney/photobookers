import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Button from "../../../components/app/Button.js";
import { fadeTransition } from "../../../lib/transitions.js";
import { SITE_APP } from "../../../constants/siteSocial.js";
const AppStoreBanner = () => {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "x-cloak": true,
      "x-data": "{\n        showBanner: $persist(true).as('app-store-banner'),\n        isIos: /iPhone|iPad|iPod/i.test(navigator.userAgent),\n        dismiss() { this.showBanner = false }\n      }",
      "x-show": "showBanner && isIos",
      children: /* @__PURE__ */ jsx(
        "div",
        {
          ...fadeTransition,
          class: "relative flex bg-surface-alt border-b border-outline pt-3 pb-3 text-on-surface-strong md:hidden",
          children: /* @__PURE__ */ jsxs("div", { class: "mx-auto flex items-center justify-center gap-4 px-6", children: [
            /* @__PURE__ */ jsxs("p", { class: "text-sm text-pretty", children: [
              /* @__PURE__ */ jsx("span", { class: "kicker text-accent mr-2", children: "App" }),
              "Browse photobooks on the go"
            ] }),
            /* @__PURE__ */ jsx(
              "a",
              {
                href: SITE_APP.ios.href,
                target: "_blank",
                rel: "noopener noreferrer",
                class: "inline-block",
                children: /* @__PURE__ */ jsx(Button, { variant: "solid", color: "primary", width: "auto", children: "Get the app" })
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                "x-on:click": "dismiss()",
                class: "cursor-pointer hover:opacity-75",
                "aria-label": "Dismiss app banner",
                children: "\u2715"
              }
            )
          ] })
        }
      )
    }
  );
};
var AppStoreBanner_default = AppStoreBanner;
export {
  AppStoreBanner_default as default
};
