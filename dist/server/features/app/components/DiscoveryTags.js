import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Link from "../../../components/app/Link.js";
import Pill from "../../../components/app/Pill.js";
import SectionTitle from "../../../components/app/SectionTitle.js";
import { DISCOVER_TAGS } from "../../../constants/discover.js";
import { tagBooksUrl } from "../../../lib/tags.js";
import { capitalize } from "../../../utils.js";
const DiscoveryTags = () => {
  return /* @__PURE__ */ jsxs("div", { class: "mt-2 mb-4", children: [
    /* @__PURE__ */ jsx("div", { class: "border-t-2 border-on-surface-strong pt-3 mb-4 mt-10", children: /* @__PURE__ */ jsx(SectionTitle, { className: "mb-0", kicker: "Browse by Theme", children: "Discover" }) }),
    /* @__PURE__ */ jsx("div", { class: "overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden mb-0", children: /* @__PURE__ */ jsx("div", { class: "flex w-max md:w-full items-center gap-2 whitespace-nowrap md:whitespace-normal md:justify-between", children: DISCOVER_TAGS.map((tag) => /* @__PURE__ */ jsx(Link, { href: tagBooksUrl(tag), children: /* @__PURE__ */ jsx(Pill, { children: `${capitalize(tag)}` }) }, tag)) }) })
  ] });
};
var DiscoveryTags_default = DiscoveryTags;
export {
  DiscoveryTags_default as default
};
