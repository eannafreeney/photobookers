import { describe, expect, it } from "vitest";
import {
  buildRetainedBookPrefixes,
  collectDeletedBookStoragePaths,
} from "./pruneStagingStorage";

describe("buildRetainedBookPrefixes", () => {
  it("returns gallery and cover prefixes for each sampled book", () => {
    expect(buildRetainedBookPrefixes(["book-a", "book-b"])).toEqual([
      "books/book-a/",
      "books/book-b/",
      "books/covers/book-a/",
      "books/covers/book-b/",
    ]);
  });
});

describe("collectDeletedBookStoragePaths", () => {
  it("keeps files under sampled book prefixes and deletes the rest", () => {
    expect(
      collectDeletedBookStoragePaths(
        [
          "books/book-a/gallery/1.webp",
          "books/book-z/gallery/2.webp",
          "books/covers/book-a/cover.webp",
          "books/covers/book-z/cover.webp",
        ],
        buildRetainedBookPrefixes(["book-a"]),
      ),
    ).toEqual({
      retainedCount: 2,
      deletedPaths: [
        "books/book-z/gallery/2.webp",
        "books/covers/book-z/cover.webp",
      ],
    });
  });
});
