import { jsx } from "hono/jsx/jsx-runtime";
import { DISCOVER_TAGS } from "../../../constants/discover.js";
import { tagBooksUrl } from "../../../lib/tags.js";
const DiscoveryTagChips = () => /* @__PURE__ */ jsx(
  "nav",
  {
    class: "flex flex-wrap items-center justify-center gap-2 ",
    "aria-label": "Browse photobooks by theme",
    children: DISCOVER_TAGS.map((tag) => /* @__PURE__ */ jsx(
      "a",
      {
        href: tagBooksUrl(tag),
        class: "rounded-radius border border-outline bg-surface px-3 py-1 text-xs capitalize text-on-surface transition hover:border-on-surface-strong hover:text-on-surface-strong",
        children: tag
      },
      tag
    ))
  }
);
var DiscoveryTagChips_default = DiscoveryTagChips;
export {
  DiscoveryTagChips_default as default
};
