import { describe, expect, it } from "vitest";
import {
  buildEmailImageProxyUrl,
  bunnyOptimizerImageUrl,
  emailImageFetchWidth,
  heroLcpImageSources,
  parseEmailImageProxyQuery,
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

  it("updates width on an existing render URL", () => {
    const url =
      "https://example.supabase.co/storage/v1/render/image/public/newsletter/logo.png?width=120&quality=75";
    expect(supabaseRenderImageUrl(url, { width: 240 })).toBe(
      "https://example.supabase.co/storage/v1/render/image/public/newsletter/logo.png?width=240&quality=75",
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

describe("bunnyOptimizerImageUrl", () => {
  it("adds width/quality for Bunny CDN hosts", () => {
    expect(
      bunnyOptimizerImageUrl("https://cdn.photobookers.com/books/a.webp", {
        width: 600,
      }),
    ).toBe("https://cdn.photobookers.com/books/a.webp?width=600&quality=75");
  });

  it("leaves non-Bunny hosts alone", () => {
    expect(
      bunnyOptimizerImageUrl("https://example.com/a.webp", { width: 600 }),
    ).toBe("https://example.com/a.webp");
  });
});

describe("email image proxy helpers", () => {
  it("builds and parses proxy query params", () => {
    const url = buildEmailImageProxyUrl(
      "https://www.photobookers.com",
      "https://cdn.photobookers.com/x.webp",
      { width: 348 },
    );
    expect(url).toContain("/api/email-image?");
    const parsed = parseEmailImageProxyQuery({
      u: "https://cdn.photobookers.com/x.webp",
      w: "348",
      q: "75",
    });
    expect(parsed).toEqual({
      sourceUrl: "https://cdn.photobookers.com/x.webp",
      width: 348,
      quality: 75,
    });
  });

  it("rejects disallowed proxy hosts", () => {
    expect(
      parseEmailImageProxyQuery({
        u: "https://evil.example/x.webp",
        w: "100",
      }),
    ).toBeNull();
  });

  it("caps retina fetch width", () => {
    expect(emailImageFetchWidth(800)).toBe(1200);
    expect(emailImageFetchWidth(120)).toBe(240);
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
