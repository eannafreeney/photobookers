import { describe, expect, it } from "vitest";
import { INTRO_PINNED_INSTAGRAM_SLIDES } from "./introPinnedPostContent";
import { buildIntroPinnedSlideOverlaySvg } from "./renderIntroPinnedSlide";

describe("buildIntroPinnedSlideOverlaySvg", () => {
  it("renders black background and slide copy", () => {
    const svg = buildIntroPinnedSlideOverlaySvg(INTRO_PINNED_INSTAGRAM_SLIDES[0]!);
    expect(svg).toContain('fill="#0a0a0a"');
    expect(svg).toContain("PHOTOBOOKERS");
    expect(svg).toContain("for photobook discovery.");
  });

  it("includes audience kickers", () => {
    const fan = buildIntroPinnedSlideOverlaySvg(
      INTRO_PINNED_INSTAGRAM_SLIDES.find((slide) => slide.kicker === "For fans")!,
    );
    expect(fan).toContain("FOR FANS");
  });

  it("uses the same body font size on every slide", () => {
    for (const slide of INTRO_PINNED_INSTAGRAM_SLIDES) {
      const svg = buildIntroPinnedSlideOverlaySvg(slide);
      const bodyFontSizes = [
        ...svg.matchAll(/font-family="Fraunces" font-size="(\d+)"/g),
      ].map((match) => match[1]);
      expect(new Set(bodyFontSizes).size).toBe(1);
      expect(bodyFontSizes[0]).toBe("44");
    }
  });
});
