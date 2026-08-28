import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { cardCropPreview, parseCoverQuality } from "./coverQuality";

describe("parseCoverQuality", () => {
  it("passes on ok true", () => {
    expect(parseCoverQuality('{"ok":true}')).toEqual({ ok: true });
  });

  it("fails with the model reason", () => {
    expect(
      parseCoverQuality(
        '{"ok":false,"reason":"The top of the book is cut off."}',
      ),
    ).toEqual({ ok: false, reason: "The top of the book is cut off." });
  });

  it("passes when the payload is junk", () => {
    expect(parseCoverQuality("not json")).toEqual({ ok: true });
    expect(parseCoverQuality('{"ok":false}')).toEqual({ ok: true });
  });
});

describe("cardCropPreview", () => {
  it("center-crops to the square card", async () => {
    const landscape = await sharp({
      create: { width: 800, height: 400, channels: 3, background: "red" },
    })
      .png()
      .toBuffer();

    const out = await cardCropPreview(landscape);
    const meta = await sharp(out).metadata();
    expect(meta.width).toBe(512);
    expect(meta.height).toBe(512);
  });
});
