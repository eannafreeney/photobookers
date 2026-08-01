import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import VerifiedCreator from "../../../../components/app/VerifiedCreator.js";
const CreatorAvatar = ({ creator, class: className = "size-16" }) => /* @__PURE__ */ jsxs("div", { class: "relative shrink-0", children: [
  creator.coverUrl ? /* @__PURE__ */ jsx(
    "img",
    {
      src: creator.coverUrl,
      alt: creator.displayName,
      class: `${className} rounded-full border border-outline object-cover`
    }
  ) : /* @__PURE__ */ jsx(
    "span",
    {
      class: `flex ${className} items-center justify-center rounded-full border border-outline bg-surface-alt text-lg font-semibold text-on-surface`,
      "aria-hidden": "true",
      children: creator.displayName.charAt(0)
    }
  ),
  /* @__PURE__ */ jsx("div", { class: "absolute top-0.5 right-0.5", children: /* @__PURE__ */ jsx(VerifiedCreator, { creatorStatus: creator.status ?? "stub", size: "xs" }) })
] });
var CreatorAvatar_default = CreatorAvatar;
export {
  CreatorAvatar_default as default
};
