import { describe, expect, it } from "vitest";
import { adminBookSortHref, parseAdminBookSort } from "./sort";

describe("parseAdminBookSort", () => {
  it("ignores unknown columns and falls back to the column default", () => {
    expect(parseAdminBookSort("cover", "desc")).toBeNull();
    expect(parseAdminBookSort("views")).toEqual({
      column: "views",
      dir: "desc",
    });
    expect(parseAdminBookSort("title", "desc")).toEqual({
      column: "title",
      dir: "desc",
    });
  });
});

describe("adminBookSortHref", () => {
  it("starts metrics high-to-low and flips the active column", () => {
    expect(adminBookSortHref("favorites", null, {})).toBe(
      "/dashboard/admin/books?sort=favorites&dir=desc",
    );
    expect(
      adminBookSortHref(
        "favorites",
        { column: "favorites", dir: "desc" },
        { status: "approved", search: "paris" },
      ),
    ).toBe(
      "/dashboard/admin/books?status=approved&search=paris&sort=favorites&dir=asc",
    );
  });
});
