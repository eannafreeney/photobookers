function outboundPurchasePath(bookSlug, source) {
  const qs = source && source !== "web" ? `?source=${source}` : "";
  return `/out/${bookSlug}${qs}`;
}
function appendPurchaseUtmParams(purchaseUrl, bookSlug) {
  try {
    const url = new URL(purchaseUrl);
    url.searchParams.set("utm_source", "photobookers");
    url.searchParams.set("utm_medium", "referral");
    url.searchParams.set("utm_campaign", `book-${bookSlug}`);
    return url.toString();
  } catch {
    return purchaseUrl;
  }
}
function isHttpPurchaseUrl(url) {
  return /^https?:\/\//i.test(url.trim());
}
function parsePurchaseClickSource(value) {
  if (value === "hyperview") return "hyperview";
  return "web";
}
export {
  appendPurchaseUtmParams,
  isHttpPurchaseUrl,
  outboundPurchasePath,
  parsePurchaseClickSource
};
