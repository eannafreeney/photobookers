import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Banner from "../../../components/app/Banner.js";
import { SITE_SKOOL } from "../../../constants/siteSocial.js";
const SkoolCommunityBanner = () => /* @__PURE__ */ jsx(
  "div",
  {
    "x-cloak": true,
    "x-data": "{ show: $persist(true).as('skool-community-banner') }",
    "x-show": "show",
    children: /* @__PURE__ */ jsx(
      Banner,
      {
        type: "info",
        message: "Working on a photobook? Get feedback and learn about editing, design, printing, and more.",
        children: /* @__PURE__ */ jsxs("div", { class: "flex flex-col items-center gap-3 sm:flex-row", children: [
          /* @__PURE__ */ jsx(
            "a",
            {
              href: SITE_SKOOL.href,
              target: "_blank",
              rel: "noopener noreferrer",
              class: "text-sm font-medium underline decoration-accent underline-offset-4",
              children: "Publish Your Photobook"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              "x-on:click": "show = false",
              class: "text-sm cursor-pointer hover:opacity-75",
              children: "Dismiss"
            }
          )
        ] })
      }
    )
  }
);
var SkoolCommunityBanner_default = SkoolCommunityBanner;
export {
  SkoolCommunityBanner_default as default
};
