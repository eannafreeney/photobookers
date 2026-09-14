import { describe, expect, it } from "vitest";
import {
  flattenPressClips,
  formatPressPublishedAt,
  pressLinkHost,
  sortPressClips,
  type PressClipBook,
} from "./pressClips";

const book = (
  overrides: Partial<PressClipBook> & Pick<PressClipBook, "slug" | "title">,
): PressClipBook => ({
  coverUrl: null,
  artist: null,
  publisher: null,
  pressLinks: [],
  releaseDate: null,
  ...overrides,
});

describe("pressLinkHost", () => {
  it("strips www and returns the hostname", () => {
    expect(pressLinkHost("https://www.bjp-online.com/review")).toBe(
      "bjp-online.com",
    );
  });

  it("returns the raw string when the URL is invalid", () => {
    expect(pressLinkHost("not a url")).toBe("not a url");
  });
});

describe("flattenPressClips", () => {
  it("emits one clip per link in book then link order", () => {
    const clips = flattenPressClips([
      book({
        slug: "newer",
        title: "Newer",
        artist: { displayName: "Ada", slug: "ada" },
        pressLinks: [
          { title: "BJP", url: "https://bjp.example/a", quote: "Sharp" },
          { title: "ASX", url: "https://asx.example/a", quote: null },
        ],
      }),
      book({
        slug: "older",
        title: "Older",
        publisher: { displayName: "MACK", slug: "mack" },
        pressLinks: [{ title: "C4", url: "https://c4.example/a" }],
      }),
    ]);

    expect(clips.map((c) => c.link.title)).toEqual(["BJP", "ASX", "C4"]);
    expect(clips[0].book).toEqual({
      slug: "newer",
      title: "Newer",
      coverUrl: null,
      artist: { displayName: "Ada", slug: "ada" },
      publisher: null,
      releaseDate: null,
    });
    expect(clips[2].book.publisher?.displayName).toBe("MACK");
  });

  it("skips books with no links", () => {
    expect(
      flattenPressClips([
        book({ slug: "empty", title: "Empty", pressLinks: [] }),
        book({ slug: "nullish", title: "Nullish", pressLinks: null }),
      ]),
    ).toEqual([]);
  });
});

describe("sortPressClips", () => {
  it("sorts by publishedAt then book release date, newest first", () => {
    const clips = flattenPressClips([
      book({
        slug: "old-book",
        title: "Old book",
        releaseDate: new Date("2020-01-01T00:00:00Z"),
        pressLinks: [
          {
            title: "Dated review",
            url: "https://example.com/dated",
            publishedAt: "2024-06-01",
          },
          { title: "Undated on old book", url: "https://example.com/undated" },
        ],
      }),
      book({
        slug: "new-book",
        title: "New book",
        releaseDate: new Date("2023-01-01T00:00:00Z"),
        pressLinks: [{ title: "Undated on new book", url: "https://example.com/new" }],
      }),
    ]);

    expect(sortPressClips(clips).map((c) => c.link.title)).toEqual([
      "Dated review",
      "Undated on new book",
      "Undated on old book",
    ]);
  });
});

describe("formatPressPublishedAt", () => {
  it("formats a YYYY-MM-DD date", () => {
    expect(formatPressPublishedAt("2024-06-01")).toBe("1st June 2024");
  });

  it("returns null for missing or invalid values", () => {
    expect(formatPressPublishedAt(null)).toBeNull();
    expect(formatPressPublishedAt("nope")).toBeNull();
  });
});
