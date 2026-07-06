import { Fragment, jsx } from "hono/jsx/jsx-runtime";
import { Image, Style } from "../../../lib/hxml-comps.js";
const VerificationBadge = ({ isVerified, baseUrl }) => {
  if (!isVerified || !baseUrl) return null;
  return /* @__PURE__ */ jsx(
    Image,
    {
      source: `${baseUrl}/icons/verified.png`,
      style: "verified-badge",
      "resize-mode": "contain"
    }
  );
};
var VerificationBadge_default = VerificationBadge;
const verificationBadgeStyles = () => /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx(Style, { id: "verified-badge", width: 16, height: 16 }) });
export {
  VerificationBadge_default as default,
  verificationBadgeStyles
};
