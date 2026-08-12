import { describe, expect, it } from "vitest";
import { resizeRemoteImageForEmail } from "./emailImageProxy";
import { MAX_NEWSLETTER_IMAGE_BYTES } from "./imageUrl";

describe("resizeRemoteImageForEmail", () => {
  it("rejects disallowed hosts", async () => {
    await expect(
      resizeRemoteImageForEmail("https://evil.example/a.jpg", { width: 200 }),
    ).rejects.toMatchObject({ status: 400 });
  });

  it("resizes the newsletter logo under the email byte budget", async () => {
    const { body, contentType } = await resizeRemoteImageForEmail(
      "https://dbmbrwmygpnhjyyccbjp.supabase.co/storage/v1/object/public/newsletter/logo.png",
      { width: 240 },
    );
    expect(contentType).toBe("image/jpeg");
    expect(body.byteLength).toBeGreaterThan(500);
    expect(body.byteLength).toBeLessThan(MAX_NEWSLETTER_IMAGE_BYTES);
    // Original logo is ~386KB; resized JPEG should be far smaller.
    expect(body.byteLength).toBeLessThan(20_000);
  }, 20_000);

  it("resizes an oversized creator cover under the email byte budget", async () => {
    const { body } = await resizeRemoteImageForEmail(
      "https://cdn.photobookers.com/creators/covers/0bc9ff88-6dda-4da7-a440-85c60c5ebdc5/1785095443674-4mons8.webp",
      { width: 348 },
    );
    expect(body.byteLength).toBeLessThan(MAX_NEWSLETTER_IMAGE_BYTES);
    expect(body.byteLength).toBeLessThan(40_000);
  }, 20_000);
});
