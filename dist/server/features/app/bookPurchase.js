import { outboundPurchasePath } from "../purchase-clicks/urls.js";
function getBookPurchaseAction({
  availabilityStatus,
  purchaseLink,
  artistName,
  publisherName,
  bookSlug,
  trackOutbound = true
}) {
  if (availabilityStatus === "sold_out") return { kind: "sold_out" };
  if (availabilityStatus === "unavailable") return { kind: "unavailable" };
  const href = purchaseLink?.trim();
  if (!href) return { kind: "none" };
  const name = publisherName?.trim() || artistName?.trim();
  return {
    kind: "buy",
    href: trackOutbound ? outboundPurchasePath(bookSlug) : href,
    label: name ? `Buy from ${name} \u2192` : "Buy \u2192"
  };
}
export {
  getBookPurchaseAction
};
