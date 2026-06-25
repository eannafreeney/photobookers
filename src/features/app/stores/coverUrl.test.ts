import { describe, expect, it } from "vitest";
import { getStoreCoverUrl, resolveStoreCoverUrl } from "./coverUrl";

describe("getStoreCoverUrl", () => {
  it("returns a stable texture URL for a slug", () => {
    const url = getStoreCoverUrl("dashwood-books");
    expect(url).toBe(getStoreCoverUrl("dashwood-books"));
    expect(url).toMatch(
      /^https:\/\/static\.photos\/textures\/1024x576\/\d+$/,
    );
  });

  it("returns different URLs for different slugs", () => {
    expect(getStoreCoverUrl("store-a")).not.toBe(getStoreCoverUrl("store-b"));
  });
});

describe("resolveStoreCoverUrl", () => {
  it("prefers uploaded coverUrl over generated texture", () => {
    expect(
      resolveStoreCoverUrl({
        slug: "dashwood-books",
        coverUrl: "https://example.com/cover.jpg",
      }),
    ).toBe("https://example.com/cover.jpg");
  });

  it("falls back to generated texture when coverUrl is empty", () => {
    expect(
      resolveStoreCoverUrl({
        slug: "dashwood-books",
        coverUrl: null,
      }),
    ).toBe(getStoreCoverUrl("dashwood-books"));
  });
});
