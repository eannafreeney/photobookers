import { describe, expect, it } from "vitest";
import {
  MAX_BOOK_PRESS_LINKS,
  bookPressLinkSchema,
  pressLinksFormField,
} from "./pressLinks";

describe("bookPressLinkSchema", () => {
  it("accepts a valid link", () => {
    const parsed = bookPressLinkSchema.parse({
      title: "BJP",
      url: "https://example.com/review",
      quote: "A fine book",
    });
    expect(parsed).toEqual({
      title: "BJP",
      url: "https://example.com/review",
      quote: "A fine book",
    });
  });

  it("normalizes empty quote to null", () => {
    const parsed = bookPressLinkSchema.parse({
      title: "BJP",
      url: "https://example.com/review",
      quote: "  ",
    });
    expect(parsed.quote).toBeNull();
  });

  it("rejects invalid urls", () => {
    expect(() =>
      bookPressLinkSchema.parse({
        title: "BJP",
        url: "not-a-url",
      }),
    ).toThrow();
  });
});

describe("pressLinksFormField", () => {
  it("treats empty / missing as undefined", () => {
    expect(pressLinksFormField.parse(undefined)).toBeUndefined();
    expect(pressLinksFormField.parse("")).toBeUndefined();
  });

  it("parses a JSON string", () => {
    const parsed = pressLinksFormField.parse(
      JSON.stringify([
        { title: "BJP", url: "https://example.com/a", quote: null },
      ]),
    );
    expect(parsed).toHaveLength(1);
    expect(parsed?.[0].title).toBe("BJP");
  });

  it("accepts an already-parsed array", () => {
    const parsed = pressLinksFormField.parse([
      { title: "BJP", url: "https://example.com/a" },
    ]);
    expect(parsed).toHaveLength(1);
  });

  it(`rejects more than ${MAX_BOOK_PRESS_LINKS} links`, () => {
    const tooMany = Array.from({ length: MAX_BOOK_PRESS_LINKS + 1 }, (_, i) => ({
      title: `Outlet ${i}`,
      url: `https://example.com/${i}`,
    }));
    expect(() => pressLinksFormField.parse(JSON.stringify(tooMany))).toThrow();
  });
});
