import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import Link from "../../../components/app/Link.js";
import VerifiedCreator from "../../../components/app/VerifiedCreator.js";
import { truncate } from "../../../lib/utils.js";
import { getImageSizeClass } from "../utils.js";
const CreatorsCircle = ({ creator, size = 32, showType = false }) => {
  if (!creator) return /* @__PURE__ */ jsx(Fragment, {});
  return /* @__PURE__ */ jsx("div", { class: "flex flex-col items-center gap-4", children: /* @__PURE__ */ jsxs("a", { href: `/creators/${creator.slug}`, children: [
    /* @__PURE__ */ jsxs("div", { class: "relative inline-block", children: [
      /* @__PURE__ */ jsx(
        "img",
        {
          src: creator.coverUrl ?? "",
          alt: creator.displayName ?? "",
          title: creator.displayName ?? "",
          class: `rounded-full object-cover ${getImageSizeClass(size)}`
        }
      ),
      /* @__PURE__ */ jsx("div", { class: "absolute top-0 right-3", children: /* @__PURE__ */ jsx(VerifiedCreator, { creatorStatus: creator.status, size: "sm" }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { class: "flex flex-col items-center gap-1", children: [
      /* @__PURE__ */ jsx(Link, { href: `/creators/${creator.slug}`, children: /* @__PURE__ */ jsx("span", { class: "text-sm font-medium", children: truncate(creator.displayName ?? "", 20) }) }),
      showType ? /* @__PURE__ */ jsx("span", { class: "kicker text-on-surface-weak text-xs capitalize", children: creator.type }) : null
    ] })
  ] }, creator.id ?? creator.slug) });
};
var CreatorsCircle_default = CreatorsCircle;
export {
  CreatorsCircle_default as default
};
