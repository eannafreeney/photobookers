import type { PurchaseClickSource } from "../../db/schema";

export function outboundPurchasePath(
  bookSlug: string,
  source?: PurchaseClickSource,
): string {
  const qs = source && source !== "web" ? `?source=${source}` : "";
  return `/out/${bookSlug}${qs}`;
}

export function appendPurchaseUtmParams(
  purchaseUrl: string,
  bookSlug: string,
): string {
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

export function isHttpPurchaseUrl(url: string): boolean {
  return /^https?:\/\//i.test(url.trim());
}

export function parsePurchaseClickSource(
  value: string | undefined,
): PurchaseClickSource {
  if (value === "hyperview") return "hyperview";
  return "web";
}
