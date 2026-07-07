import { describe, expect, it } from "vitest";
import {
  collectRetainedBookImagePaths,
  storagePathFromPublicUrl,
} from "./pruneStagingStorage";

describe("storagePathFromPublicUrl", () => {
  it("extracts paths from Supabase public object URLs", () => {
    expect(
      storagePathFromPublicUrl(
        "https://example.supabase.co/storage/v1/object/public/images/books/123/cover.webp",
      ),
    ).toBe("books/123/cover.webp");
  });

  it("extracts paths from Supabase render URLs", () => {
    expect(
      storagePathFromPublicUrl(
        "https://example.supabase.co/storage/v1/render/image/public/images/books/123/cover%201.webp?width=800",
      ),
    ).toBe("books/123/cover 1.webp");
  });

  it("ignores non-book bucket paths", () => {
    expect(
      storagePathFromPublicUrl(
        "https://example.supabase.co/storage/v1/object/public/images/creators/123/cover.webp",
      ),
    ).toBeNull();
  });
});

describe("collectRetainedBookImagePaths", () => {
  it("deduplicates and sorts valid book image paths", () => {
    expect(
      collectRetainedBookImagePaths([
        "https://example.supabase.co/storage/v1/object/public/images/books/b/cover.webp",
        "https://example.supabase.co/storage/v1/render/image/public/images/books/a/cover.webp?width=800",
        "https://example.supabase.co/storage/v1/object/public/images/books/b/cover.webp",
        null,
        "https://example.com/other.webp",
      ]),
    ).toEqual(["books/a/cover.webp", "books/b/cover.webp"]);
  });
});
