import { outboundPurchasePath } from "../purchase-clicks/urls.js";
function getBookPurchaseAction({
  availabilityStatus,
  purchaseLink,
  bookSlug,
  trackOutbound = true
}) {
  if (availabilityStatus === "sold_out") return { kind: "sold_out" };
  if (availabilityStatus === "unavailable") return { kind: "unavailable" };
  const href = purchaseLink?.trim();
  if (!href) return { kind: "none" };
  return {
    kind: "buy",
    href: trackOutbound ? outboundPurchasePath(bookSlug) : href,
    label: "Buy \u2192"
  };
}
export {
  getBookPurchaseAction
};
