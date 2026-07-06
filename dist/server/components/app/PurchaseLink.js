import { Fragment, jsx } from "hono/jsx/jsx-runtime";
import Button from "./Button.js";
import Link from "./Link.js";
import { outboundPurchasePath } from "../../features/purchase-clicks/urls.js";
const PurchaseLink = ({
  bookSlug,
  purchaseLink,
  trackOutbound = true
}) => {
  if (!purchaseLink) return /* @__PURE__ */ jsx(Fragment, {});
  const href = trackOutbound ? outboundPurchasePath(bookSlug) : purchaseLink;
  return /* @__PURE__ */ jsx(Link, { href, target: "_blank", children: /* @__PURE__ */ jsx(Button, { variant: "solid", color: "accent", width: "lg", children: /* @__PURE__ */ jsx("span", { children: "See More \u2192" }) }) });
};
var PurchaseLink_default = PurchaseLink;
export {
  PurchaseLink_default as default
};
