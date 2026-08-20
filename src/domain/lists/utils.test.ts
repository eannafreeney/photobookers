import { describe, expect, it } from "vitest";
import {
  isReservedListSlug,
  isFavoritesListSlug,
  isFavoritesListId,
  FAVORITES_LIST_ID,
  FAVORITES_LIST_SLUG,
  commentBodyAsListNote,
  LIST_ITEM_NOTE_MAX_LENGTH,
  listSlugSchema,
  listTitleSchema,
  slugFromTitle,
  withListSlugSuffix,
  isListPromotionEligible,
  listItemNoteSchema,
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

describe("isFavoritesListSlug", () => {
  it("matches both spellings", () => {
    expect(isFavoritesListSlug("favorites")).toBe(true);
    expect(isFavoritesListSlug("favourites")).toBe(true);
    expect(isFavoritesListSlug("favourite-books")).toBe(false);
  });
});

describe("isFavoritesListId", () => {
  it("matches the sentinel id", () => {
    expect(isFavoritesListId(FAVORITES_LIST_ID)).toBe(true);
    expect(isFavoritesListId(FAVORITES_LIST_SLUG)).toBe(true);
    expect(isFavoritesListId("some-uuid")).toBe(false);
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

describe("listItemNoteSchema", () => {
  it("trims and allows empty notes", () => {
    expect(listItemNoteSchema.parse("  ")).toBe(null);
    expect(listItemNoteSchema.parse("A favourite.")).toBe("A favourite.");
  });

  it("rejects notes over 1000 characters", () => {
    expect(listItemNoteSchema.safeParse("a".repeat(1000)).success).toBe(true);
    expect(listItemNoteSchema.safeParse("a".repeat(1001)).success).toBe(false);
  });
});

describe("commentBodyAsListNote", () => {
  it("trims and caps at the note max length", () => {
    expect(commentBodyAsListNote("  Hello  ")).toBe("Hello");
    expect(commentBodyAsListNote("a".repeat(LIST_ITEM_NOTE_MAX_LENGTH + 50))).toBe(
      "a".repeat(LIST_ITEM_NOTE_MAX_LENGTH),
    );
  });
});

describe("userCanManageBookLists", () => {
  it("is true for any signed-in user", () => {
    expect(userCanManageBookLists({ id: "u1" })).toBe(true);
    expect(userCanManageBookLists({ id: "u2" })).toBe(true);
    expect(userCanManageBookLists({})).toBe(false);
    expect(userCanManageBookLists(null)).toBe(false);
  });
});
