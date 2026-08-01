import { describe, expect, it } from "vitest";
import {
  isReservedListSlug,
  listSlugSchema,
  listTitleSchema,
  slugFromTitle,
  withListSlugSuffix,
  isListPromotionEligible,
  userCanManageBookLists,
} from "./utils";

describe("listSlugSchema", () => {
  it("normalizes and validates slugs", () => {
    expect(listSlugSchema.parse("  Favourite-Books ")).toBe("favourite-books");
  });

  it("rejects invalid slugs", () => {
    expect(listSlugSchema.safeParse("").success).toBe(false);
    expect(listSlugSchema.safeParse("bad slug").success).toBe(false);
  });
});

describe("listTitleSchema", () => {
  it("requires a non-empty title", () => {
    expect(listTitleSchema.safeParse("").success).toBe(false);
    expect(listTitleSchema.parse("  Favourites of 2026  ")).toBe(
      "Favourites of 2026",
    );
  });
});

describe("slugFromTitle", () => {
  it("slugifies a title", () => {
    expect(slugFromTitle("Favourite Books of the Year")).toBe(
      "favourite-books-of-the-year",
    );
  });
});

describe("withListSlugSuffix", () => {
  it("appends numeric suffix after the first collision", () => {
    expect(withListSlugSuffix("favourites", 1)).toBe("favourites");
    expect(withListSlugSuffix("favourites", 2)).toBe("favourites-2");
  });
});

describe("isReservedListSlug", () => {
  it("blocks reserved slugs", () => {
    expect(isReservedListSlug("favorites")).toBe(true);
    expect(isReservedListSlug("favourites")).toBe(true);
    expect(isReservedListSlug("my-list")).toBe(false);
  });
});

describe("isListPromotionEligible", () => {
  it("requires public list and public shelf with slug", () => {
    expect(
      isListPromotionEligible(
        { isPublic: true },
        { shelfPublic: true, shelfSlug: "jane" },
      ),
    ).toBe(true);
    expect(
      isListPromotionEligible(
        { isPublic: false },
        { shelfPublic: true, shelfSlug: "jane" },
      ),
    ).toBe(false);
    expect(
      isListPromotionEligible(
        { isPublic: true },
        { shelfPublic: false, shelfSlug: "jane" },
      ),
    ).toBe(false);
    expect(
      isListPromotionEligible(
        { isPublic: true },
        { shelfPublic: true, shelfSlug: null },
      ),
    ).toBe(false);
  });
});

describe("userCanManageBookLists", () => {
  it("allows collectors and blocks creators", () => {
    expect(userCanManageBookLists({ creator: null })).toBe(true);
    expect(userCanManageBookLists({ creator: undefined })).toBe(true);
    expect(userCanManageBookLists({ creator: { id: "c1" } })).toBe(false);
    expect(userCanManageBookLists(null)).toBe(false);
  });
});
