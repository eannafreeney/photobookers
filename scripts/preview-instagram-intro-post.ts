/**
 * Preview the pinned intro Instagram carousel (black background + big text).
 *
 *   npx tsx scripts/preview-instagram-intro-post.ts
 *
 * Writes slides to output/instagram-intro-pinned/
 */

import "./env";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { INTRO_PINNED_INSTAGRAM_CAPTION, INTRO_PINNED_INSTAGRAM_SLIDES } from "../src/domain/planner/instagramSlides/introPinnedPostContent";
import { renderIntroPinnedCarouselSlides } from "../src/domain/planner/instagramSlides/renderIntroPinnedSlide";

async function run() {
  const outDir = join(process.cwd(), "output", "instagram-intro-pinned");
  mkdirSync(outDir, { recursive: true });

  const slides = await renderIntroPinnedCarouselSlides(
    INTRO_PINNED_INSTAGRAM_SLIDES,
  );

  for (let index = 0; index < slides.length; index += 1) {
    const buffer = slides[index];
    if (!buffer) continue;
    const filePath = join(outDir, `slide-${index + 1}.webp`);
    writeFileSync(filePath, buffer);
    console.log("Wrote:", filePath);
  }

  writeFileSync(join(outDir, "caption.txt"), INTRO_PINNED_INSTAGRAM_CAPTION);
  console.log("Wrote:", join(outDir, "caption.txt"));
  console.log("Done:", outDir);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
