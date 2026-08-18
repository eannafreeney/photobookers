import type { BookAvailabilityStatus } from "../../db/schema";
import { outboundPurchasePath } from "../purchase-clicks/urls";

export type BookPurchaseAction =
  | { kind: "buy"; href: string; label: string }
  | { kind: "sold_out" }
  | { kind: "unavailable" }
  | { kind: "none" };

type GetBookPurchaseActionParams = {
  availabilityStatus: BookAvailabilityStatus;
  purchaseLink: string | null;
  artistName?: string | null;
  publisherName?: string | null;
  bookSlug: string;
  trackOutbound?: boolean;
};

export function getBookPurchaseAction({
  availabilityStatus,
  purchaseLink,
  artistName,
  publisherName,
  bookSlug,
  trackOutbound = true,
}: GetBookPurchaseActionParams): BookPurchaseAction {
  if (availabilityStatus === "sold_out") return { kind: "sold_out" };
  if (availabilityStatus === "unavailable") return { kind: "unavailable" };

  const href = purchaseLink?.trim();
  if (!href) return { kind: "none" };

  const name = publisherName?.trim() || artistName?.trim();
  return {
    kind: "buy",
    href: trackOutbound ? outboundPurchasePath(bookSlug) : href,
    label: name ? `Buy from ${name} →` : "Buy →",
  };
}
