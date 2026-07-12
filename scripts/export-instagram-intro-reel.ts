/**
 * Export a 9:16 Reel video from the intro carousel copy (separate from the square feed post).
 *
 *   npx tsx scripts/export-instagram-intro-reel.ts
 *
 * Requires ffmpeg on PATH. Writes output/instagram-intro-reel/intro-reel.mp4
 * Optional: INTRO_REEL_SECONDS_PER_SLIDE=3
 */

import "./env";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { INTRO_PINNED_INSTAGRAM_SLIDES } from "../src/domain/planner/instagramSlides/introPinnedPostContent";
import { renderIntroPinnedReelCarouselSlides } from "../src/domain/planner/instagramSlides/renderIntroPinnedReelSlide";

const secondsPerSlide = Number(process.env.INTRO_REEL_SECONDS_PER_SLIDE ?? "3");

function hasFfmpeg(): boolean {
  return spawnSync("ffmpeg", ["-version"], { encoding: "utf8" }).status === 0;
}

async function run() {
  const outDir = join(process.cwd(), "output", "instagram-intro-reel");
  const slidesDir = join(outDir, "slides");
  mkdirSync(slidesDir, { recursive: true });

  const slides = await renderIntroPinnedReelCarouselSlides(
    INTRO_PINNED_INSTAGRAM_SLIDES,
  );

  for (let index = 0; index < slides.length; index += 1) {
    const buffer = slides[index];
    if (!buffer) continue;
    const fileName = `slide-${String(index + 1).padStart(2, "0")}.png`;
    const filePath = join(slidesDir, fileName);
    writeFileSync(filePath, buffer);
    console.log("Wrote:", filePath);
  }

  if (!hasFfmpeg()) {
    console.log(
      "Slides ready. Install ffmpeg (brew install ffmpeg) and re-run to build intro-reel.mp4.",
    );
    return;
  }

  const mp4Path = join(outDir, "intro-reel.mp4");
  execFileSync(
    "ffmpeg",
    [
      "-y",
      "-framerate",
      String(1 / secondsPerSlide),
      "-i",
      join(slidesDir, "slide-%02d.png"),
      "-vf",
      "scale=1080:1920",
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-r",
      "30",
      mp4Path,
    ],
    { stdio: "inherit" },
  );

  console.log("Wrote:", mp4Path);
  console.log(
    `Done: ${slides.length} slides × ${secondsPerSlide}s → ${mp4Path}`,
  );
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
