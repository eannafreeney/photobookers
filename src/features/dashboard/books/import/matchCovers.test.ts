import { describe, expect, it } from "vitest";
import { matchCoversByFilename, type BookForMatching } from "./matchCovers";

describe("matchCoversByFilename", () => {
  const books: BookForMatching[] = [
    {
      id: "book-1",
      title: "Sunset Over Rio",
      slug: "sunset-over-rio",
      coverUrl: null,
    },
    {
      id: "book-2",
      title: "Winter Tales",
      slug: "winter-tales-john-doe",
      coverUrl: null,
    },
    {
      id: "book-3",
      title: "Untitled",
      slug: "untitled-jane-smith",
      coverUrl: null,
    },
  ];

  it("matches exact filename to title", () => {
    const files = [
      new File([], "sunset-over-rio.jpg"),
      new File([], "winter-tales.png"),
    ];

    const result = matchCoversByFilename(files, books);

    expect(result.matched).toHaveLength(2);
    expect(result.matched[0]?.bookTitle).toBe("Sunset Over Rio");
    expect(result.matched[1]?.bookTitle).toBe("Winter Tales");
    expect(result.unmatchedFiles).toHaveLength(0);
    expect(result.unmatchedBooks).toHaveLength(1);
  });

  it("matches filename to slug", () => {
    const files = [new File([], "winter-tales-john-doe.jpg")];

    const result = matchCoversByFilename(files, books);

    expect(result.matched).toHaveLength(1);
    expect(result.matched[0]?.bookId).toBe("book-2");
  });

  it("handles fuzzy matches", () => {
    const files = [new File([], "sunset-over-rio-final.jpg")];

    const result = matchCoversByFilename(files, books);

    expect(result.matched).toHaveLength(1);
    expect(result.matched[0]?.bookTitle).toBe("Sunset Over Rio");
  });

  it("returns unmatched files", () => {
    const files = [
      new File([], "sunset-over-rio.jpg"),
      new File([], "random-file.jpg"),
    ];

    const result = matchCoversByFilename(files, books);

    expect(result.matched).toHaveLength(1);
    expect(result.unmatchedFiles).toHaveLength(1);
    expect(result.unmatchedFiles[0]?.name).toBe("random-file.jpg");
  });

  it("does not match same book twice", () => {
    const files = [
      new File([], "sunset-over-rio.jpg"),
      new File([], "sunset-over-rio-2.jpg"),
    ];

    const result = matchCoversByFilename(files, books);

    expect(result.matched).toHaveLength(1);
    expect(result.unmatchedFiles).toHaveLength(1);
  });

  it("ignores file extensions", () => {
    const files = [
      new File([], "sunset-over-rio.jpg"),
      new File([], "winter-tales.png"),
      new File([], "winter-tales.webp"),
    ];

    const result = matchCoversByFilename(files, books);

    // winter-tales should match once, .webp becomes unmatched
    expect(result.matched).toHaveLength(2);
    expect(result.unmatchedFiles).toHaveLength(1);
  });
});
