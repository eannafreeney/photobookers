import { describe, expect, it } from "vitest";
import {
  buildBookCatalogFilterParams,
  MIN_SEARCH_LENGTH,
} from "./bookFilterParams";

describe("buildBookCatalogFilterParams", () => {
  it("omits short search queries", () => {
    const params = buildBookCatalogFilterParams({
      query: "ab",
      tag: null,
      sort: "newest",
      defaultSort: "newest",
      minLen: MIN_SEARCH_LENGTH,
    });
    expect(params.has("q")).toBe(false);
  });

  it("includes search, tag, sort, and fragment params", () => {
    const params = buildBookCatalogFilterParams(
      {
        query: "  winter light  ",
        tag: "urban",
        sort: "newest",
        defaultSort: "trending",
      },
      { includeFragment: true },
    );
    expect(params.get("q")).toBe("winter light");
    expect(params.get("tag")).toBe("urban");
    expect(params.get("sort")).toBe("newest");
    expect(params.get("fragment")).toBe("grid");
  });
});
