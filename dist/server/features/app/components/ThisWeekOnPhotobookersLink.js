import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { thisWeekPath } from "../spotlightUrls.js";
const ThisWeekOnPhotobookersLink = () => {
  return /* @__PURE__ */ jsx(
    "a",
    {
      href: thisWeekPath(),
      class: "group flex w-full flex-col items-center gap-1.5 border-2 border-on-surface-strong px-5 py-2 text-center transition-colors hover:bg-surface-alt",
      children: /* @__PURE__ */ jsxs("span", { class: "inline-flex items-center font-display text-lg font-medium text-on-surface-strong sm:text-xl", children: [
        "This week on Photobookers",
        /* @__PURE__ */ jsx("span", { children: "\xA0\u2192" })
      ] })
    }
  );
};
var ThisWeekOnPhotobookersLink_default = ThisWeekOnPhotobookersLink;
export {
  ThisWeekOnPhotobookersLink_default as default
};
