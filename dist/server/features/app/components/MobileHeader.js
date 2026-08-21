import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import VerificationBadge from "../../../components/app/VerificationBadge.js";
function MobileHeader({ kicker, title, isVerified = false, children }) {
  return /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-1 border-b-2 border-on-surface-strong pb-3", children: [
    /* @__PURE__ */ jsx("span", { class: "kicker text-accent", children: kicker }),
    /* @__PURE__ */ jsxs("div", { class: "flex items-center gap-2", children: [
      title && /* @__PURE__ */ jsx("h1", { class: "font-display text-3xl font-medium leading-tight text-on-surface-strong text-balance pb-1", children: title }),
      isVerified && /* @__PURE__ */ jsx(VerificationBadge, { creatorStatus: "verified", size: "xs" })
    ] }),
    children
  ] });
}
var MobileHeader_default = MobileHeader;
export {
  MobileHeader_default as default
};
