import { describe, expect, it } from "vitest";
import {
  MAX_NEWSLETTER_IMAGE_BYTES,
  pickNewsletterImageUrl,
  probeNewsletterImageSizes,
  rewriteNewsletterImagesForEmail,
} from "./emailImages";

describe("pickNewsletterImageUrl", () => {
  it("uses Supabase render transform when possible", () => {
    const src =
      "https://dbmbrwmygpnhjyyccbjp.supabase.co/storage/v1/object/public/newsletter/logo.png";
    expect(
      pickNewsletterImageUrl(src, {
        displayWidthPx: 120,
        contentLengthBytes: 400_000,
      }),
    ).toContain("/storage/v1/render/image/public/newsletter/logo.png?width=240");
  });

  it("proxies oversized Bunny CDN images through /api/email-image", () => {
    const src =
      "https://cdn.photobookers.com/creators/covers/big.webp";
    const out = pickNewsletterImageUrl(src, {
      displayWidthPx: 174,
      contentLengthBytes: 500_000,
      appBaseUrl: "https://www.photobookers.com",
    });
    expect(out).toContain("https://www.photobookers.com/api/email-image?");
    expect(out).toContain(encodeURIComponent(src));
    expect(out).toContain("w=348");
  });

  it("keeps small Bunny images on the CDN with optimizer params", () => {
    const src = "https://cdn.photobookers.com/books/covers/small.webp";
    const out = pickNewsletterImageUrl(src, {
      displayWidthPx: 550,
      contentLengthBytes: 40_000,
    });
    expect(out).toContain("width=1100");
    expect(out).toContain("quality=75");
    expect(out).not.toContain("/api/email-image");
  });
});

describe("rewriteNewsletterImagesForEmail", () => {
  it("rewrites oversized CDN imgs via the proxy", async () => {
    const html = `<img src="https://cdn.photobookers.com/creators/covers/big.webp" width="174" alt="x" />`;
    const out = await rewriteNewsletterImagesForEmail(html, {
      appBaseUrl: "https://www.photobookers.com",
      probe: async () => 500_000,
    });
    expect(out).toContain("/api/email-image?");
    expect(out).toContain("w=348");
  });

  it("leaves non-allowlisted hosts untouched", async () => {
    const html = `<img src="https://example.com/cover.jpg" width="550" alt="x" />`;
    const out = await rewriteNewsletterImagesForEmail(html, {
      probe: async () => {
        throw new Error("should not probe");
      },
    });
    expect(out).toContain("https://example.com/cover.jpg");
  });
});

describe("probeNewsletterImageSizes", () => {
  it("flags images over the newsletter byte budget", async () => {
    const html = `
      <img src="https://cdn.photobookers.com/ok.webp" />
      <img src="https://cdn.photobookers.com/big.webp" />
    `;
    const sizes = new Map([
      ["https://cdn.photobookers.com/ok.webp", 40_000],
      ["https://cdn.photobookers.com/big.webp", MAX_NEWSLETTER_IMAGE_BYTES + 1],
    ]);
    const report = await probeNewsletterImageSizes(html, {
      probe: async (url) => sizes.get(url) ?? null,
    });
    expect(report.oversized).toHaveLength(1);
    expect(report.oversized[0]?.src).toContain("big.webp");
    expect(report.totalBytes).toBe(40_000 + MAX_NEWSLETTER_IMAGE_BYTES + 1);
  });
});
