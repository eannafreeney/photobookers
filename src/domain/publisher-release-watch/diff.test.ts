import { describe, expect, it } from "vitest";
import { diffPublisherProducts } from "./diff";
import {
  buildPublisherReleaseWatchEmail,
  publisherReleaseWatchEmailSubject,
} from "./emails";
import type { WatchedProduct } from "./watchlist";

const products: WatchedProduct[] = [
  { key: "a", title: "Book A", url: "https://example.com/products/a" },
  { key: "b", title: "Book B", url: "https://example.com/products/b" },
];

describe("diffPublisherProducts", () => {
  it("seeds on empty seen set without reporting new products", () => {
    const result = diffPublisherProducts(products, new Set());
    expect(result.seeded).toBe(true);
    expect(result.newProducts).toEqual([]);
  });

  it("returns only products not in the previous scrape", () => {
    const result = diffPublisherProducts(products, new Set(["a"]));
    expect(result.seeded).toBe(false);
    expect(result.newProducts).toEqual([products[1]]);
  });

  it("returns empty when nothing is new", () => {
    const result = diffPublisherProducts(products, new Set(["a", "b"]));
    expect(result.seeded).toBe(false);
    expect(result.newProducts).toEqual([]);
  });
});

describe("publisher release watch email", () => {
  it("builds a subject and includes titles + links", () => {
    expect(publisherReleaseWatchEmailSubject(2, 1)).toBe(
      "Publisher new releases — 2 new across 1 publisher",
    );
    const html = buildPublisherReleaseWatchEmail([
      {
        publisherId: "mack",
        publisherName: "MACK",
        products: [products[0]!],
      },
    ]);
    expect(html).toContain("MACK");
    expect(html).toContain("Book A");
    expect(html).toContain("https://example.com/products/a");
  });
});
