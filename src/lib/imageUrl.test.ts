import { describe, expect, it } from "vitest";
import { heroLcpImageSources, supabaseRenderImageUrl } from "./imageUrl";

describe("supabaseRenderImageUrl", () => {
  it("rewrites Supabase public object URLs to render/image", () => {
    const url =
      "https://example.supabase.co/storage/v1/object/public/images/books/covers/foo.webp";
    expect(supabaseRenderImageUrl(url, { width: 480 })).toBe(
      "https://example.supabase.co/storage/v1/render/image/public/images/books/covers/foo.webp?width=480&quality=75",
    );
  });

  it("returns the original URL for non-Supabase hosts", () => {
    expect(
      supabaseRenderImageUrl("https://cdn.example.com/cover.jpg", {
        width: 480,
      }),
    ).toBe("https://cdn.example.com/cover.jpg");
  });
});

describe("heroLcpImageSources", () => {
  it("builds srcset with mobile preload candidate", () => {
    const url =
      "https://example.supabase.co/storage/v1/object/public/images/books/covers/foo.webp";
    const sources = heroLcpImageSources(url);

    expect(sources.preloadHref).toContain("width=480");
    expect(sources.src).toBe(sources.preloadHref);
    expect(sources.srcSet).toContain("480w");
    expect(sources.srcSet).toContain("800w");
    expect(sources.srcSet).toContain("1200w");
  });
});
