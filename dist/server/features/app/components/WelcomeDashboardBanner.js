import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Button from "../../../components/app/Button.js";
import { fadeTransition } from "../../../lib/transitions.js";
const WelcomeDashboardBanner = () => {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "x-cloak": true,
      "x-data": "{\n        showBanner: $persist(false).as('welcome-dashboard-banner'),\n        init() {\n          const params = new URLSearchParams(window.location.search);\n          if (params.get('welcome') !== 'dashboard') return;\n          this.showBanner = true;\n          params.delete('welcome');\n          const qs = params.toString();\n          const next = window.location.pathname + (qs ? `?${qs}` : '') + window.location.hash;\n          history.replaceState({}, '', next);\n        },\n        dismiss() { this.showBanner = false }\n      }",
      "x-show": "showBanner",
      children: /* @__PURE__ */ jsx(
        "div",
        {
          ...fadeTransition,
          class: "relative flex bg-surface-alt border-b border-outline pt-3 pb-3 text-on-surface-strong",
          children: /* @__PURE__ */ jsxs("div", { class: "mx-auto flex items-center justify-center gap-4 px-6", children: [
            /* @__PURE__ */ jsxs("p", { class: "text-sm text-pretty", children: [
              /* @__PURE__ */ jsx("span", { class: "kicker text-accent mr-2", children: "Welcome" }),
              "Head to your dashboard to finish your profile and add books"
            ] }),
            /* @__PURE__ */ jsx("a", { href: "/dashboard", class: "inline-block", "x-on:click": "dismiss()", children: /* @__PURE__ */ jsx(Button, { variant: "solid", color: "primary", width: "auto", children: "Go to dashboard" }) }),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                "x-on:click": "dismiss()",
                class: "cursor-pointer hover:opacity-75",
                "aria-label": "Dismiss welcome banner",
                children: "\u2715"
              }
            )
          ] })
        }
      )
    }
  );
};
var WelcomeDashboardBanner_default = WelcomeDashboardBanner;
export {
  WelcomeDashboardBanner_default as default
};
