import { describe, expect, it, vi, beforeEach } from "vitest";

const {
  findBookViewCountsMock,
  findWishlistCountsMock,
  findCollectionCountsMock,
  findPurchaseClickCountsMock,
} = vi.hoisted(() => ({
  findBookViewCountsMock: vi.fn(),
  findWishlistCountsMock: vi.fn(),
  findCollectionCountsMock: vi.fn(),
  findPurchaseClickCountsMock: vi.fn(),
}));

vi.mock("../api/services", () => ({
  findWishlistCounts: findWishlistCountsMock,
  findCollectionCounts: findCollectionCountsMock,
}));

vi.mock("../book-views/services", () => ({
  findBookViewCounts: findBookViewCountsMock,
  getCreatorBookViewTotal: vi.fn(),
  getCreatorCatalogueBookViewTotal: vi.fn(),
  getBookViewTotals: vi.fn(),
}));

vi.mock("../purchase-clicks/services", () => ({
  findPurchaseClickCounts: findPurchaseClickCountsMock,
  getCreatorCataloguePurchaseClickTotal: vi.fn(),
  getCreatorPurchaseClickTotal: vi.fn(),
  getPurchaseClickTotals: vi.fn(),
}));

vi.mock("../../db/client", () => ({
  db: {
    select: vi.fn(),
  },
}));

import {
  formatClickRate,
  getBookFunnelCounts,
} from "./funnel";

describe("formatClickRate", () => {
  it("returns null when there are no views", () => {
    expect(formatClickRate(0, 5)).toBeNull();
  });

  it("formats click rate as a percentage", () => {
    expect(formatClickRate(100, 12)).toBe("12.0%");
    expect(formatClickRate(1000, 1)).toBe("0.1%");
  });

  it("shows <0.1% for very small rates", () => {
    expect(formatClickRate(10000, 1)).toBe("<0.1%");
  });
});

describe("getBookFunnelCounts", () => {
  beforeEach(() => {
    findBookViewCountsMock.mockReset();
    findWishlistCountsMock.mockReset();
    findCollectionCountsMock.mockReset();
    findPurchaseClickCountsMock.mockReset();
  });

  it("returns an empty map for no book ids", async () => {
    const result = await getBookFunnelCounts([]);
    expect(result.size).toBe(0);
    expect(findBookViewCountsMock).not.toHaveBeenCalled();
  });

  it("merges batch counts into per-book funnel rows", async () => {
    findBookViewCountsMock.mockResolvedValue(
      new Map([
        ["book-1", 100],
        ["book-2", 50],
      ]),
    );
    findWishlistCountsMock.mockResolvedValue(
      new Map([
        ["book-1", 10],
        ["book-2", 0],
      ]),
    );
    findCollectionCountsMock.mockResolvedValue(
      new Map([
        ["book-1", 4],
        ["book-2", 2],
      ]),
    );
    findPurchaseClickCountsMock.mockResolvedValue(
      new Map([
        ["book-1", 8],
        ["book-2", 1],
      ]),
    );

    const result = await getBookFunnelCounts(["book-1", "book-2"]);

    expect(result.get("book-1")).toEqual({
      views: 100,
      favorites: 10,
      outboundClicks: 8,
    });
    expect(result.get("book-2")).toEqual({
      views: 50,
      favorites: 0,
      outboundClicks: 1,
    });
  });

  it("defaults missing counts to zero", async () => {
    findBookViewCountsMock.mockResolvedValue(new Map());
    findWishlistCountsMock.mockResolvedValue(new Map());
    findCollectionCountsMock.mockResolvedValue(new Map());
    findPurchaseClickCountsMock.mockResolvedValue(new Map());

    const result = await getBookFunnelCounts(["book-1"]);

    expect(result.get("book-1")).toEqual({
      views: 0,
      favorites: 0,
      outboundClicks: 0,
    });
  });
});
