import { describe, expect, it } from "vitest";
import { isEditorialReferer } from "./editorial";

describe("isEditorialReferer", () => {
  it("matches editorial page referers", () => {
    expect(
      isEditorialReferer("https://www.photobookers.com/featured"),
    ).toBe(true);
    expect(
      isEditorialReferer("https://www.photobookers.com/book-of-the-day/2026-03-01"),
    ).toBe(true);
    expect(
      isEditorialReferer("https://www.photobookers.com/this-week?week=2026-W10"),
    ).toBe(true);
  });

  it("rejects non-editorial referers", () => {
    expect(isEditorialReferer("https://www.photobookers.com/books/some-book")).toBe(
      false,
    );
    expect(isEditorialReferer(null)).toBe(false);
    expect(isEditorialReferer("")).toBe(false);
  });
});
