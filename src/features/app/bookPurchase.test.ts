import { describe, expect, it } from "vitest";
import { getBookPurchaseAction } from "./bookPurchase";

const base = {
  purchaseLink: "https://shop.example.com/skirts",
  publisherName: "Gost",
  bookSlug: "skirts",
};

describe("getBookPurchaseAction", () => {
  it("returns a tracked buy action when available", () => {
    expect(
      getBookPurchaseAction({ ...base, availabilityStatus: "available" }),
    ).toEqual({
      kind: "buy",
      href: "/out/skirts",
      label: "Buy from Gost →",
    });
  });

  it("uses the raw purchase link when outbound tracking is off", () => {
    expect(
      getBookPurchaseAction({
        ...base,
        availabilityStatus: "available",
        trackOutbound: false,
      }),
    ).toEqual({
      kind: "buy",
      href: "https://shop.example.com/skirts",
      label: "Buy →",
    });
  });

  it("hides the CTA when sold out even if a purchase link exists", () => {
    expect(
      getBookPurchaseAction({ ...base, availabilityStatus: "sold_out" }),
    ).toEqual({ kind: "sold_out" });
  });

  it("hides the CTA when unavailable", () => {
    expect(
      getBookPurchaseAction({ ...base, availabilityStatus: "unavailable" }),
    ).toEqual({ kind: "unavailable" });
  });

  it("returns none when available with no purchase link", () => {
    expect(
      getBookPurchaseAction({
        ...base,
        availabilityStatus: "available",
        purchaseLink: "  ",
      }),
    ).toEqual({ kind: "none" });
  });
});
