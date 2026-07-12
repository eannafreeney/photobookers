import { describe, expect, it } from "vitest";
import { INTRO_PINNED_INSTAGRAM_SLIDES } from "./introPinnedPostContent";
import { buildIntroPinnedReelSlideOverlaySvg } from "./renderIntroPinnedReelSlide";

describe("buildIntroPinnedReelSlideOverlaySvg", () => {
  it("renders native 9:16 reel dimensions", () => {
    const svg = buildIntroPinnedReelSlideOverlaySvg(
      INTRO_PINNED_INSTAGRAM_SLIDES[0]!,
    );
    expect(svg).toContain('width="1080" height="1920"');
  });

  it("wraps long lines so copy stays inside reel safe zones", () => {
    const svg = buildIntroPinnedReelSlideOverlaySvg(
      INTRO_PINNED_INSTAGRAM_SLIDES[1]!,
    );
    expect(svg).toContain("Browse books, artists,");
    expect(svg).toContain("publishers,");
  });
});
