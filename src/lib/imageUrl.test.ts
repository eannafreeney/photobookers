import { describe, expect, it } from "vitest";
import {
  heroLcpImageSources,
  resolveStoragePublicImageUrl,
  supabaseRenderImageUrl,
} from "./imageUrl";

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

describe("resolveStoragePublicImageUrl", () => {
  it("rewrites current-project Supabase public URLs to Bunny URLs", () => {
    process.env.STORAGE_PROVIDER = "bunny";
    process.env.SUPABASE_URL = "https://staging-project.supabase.co";
    process.env.BUNNY_CDN_BASE = "https://cdn-staging.photobookers.com";

    const url =
      "https://staging-project.supabase.co/storage/v1/object/public/images/books/covers/foo.webp";

    expect(resolveStoragePublicImageUrl(url)).toBe(
      "https://cdn-staging.photobookers.com/books/covers/foo.webp",
    );
  });

  it("leaves other Supabase project URLs unchanged", () => {
    process.env.STORAGE_PROVIDER = "bunny";
    process.env.SUPABASE_URL = "https://staging-project.supabase.co";
    process.env.BUNNY_CDN_BASE = "https://cdn-staging.photobookers.com";

    const url =
      "https://production-project.supabase.co/storage/v1/object/public/images/books/covers/foo.webp";

    expect(resolveStoragePublicImageUrl(url)).toBe(url);
  });
});
