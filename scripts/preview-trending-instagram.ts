/**
 * Preview trending Instagram carousel slides locally.
 *
 * Usage:
 *   npx tsx scripts/preview-trending-instagram.ts
 *   npx tsx scripts/preview-trending-instagram.ts 2026-07-10
 *
 * Writes slides to output/trending-instagram-YYYY-MM-DD/
 */

import "./env";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  buildTrendingInstagramCaptions,
  trendingItemsForKind,
} from "../src/domain/planner/trendingInstagram/captions";
import { renderTrendingCarouselSlides } from "../src/domain/planner/trendingInstagram/renderTrendingSlide";
import { getCompletedNewsletterEditionRange } from "../src/domain/planner/trendingInstagram/schedule";
import { getTrendingForRange } from "../src/domain/planner/trending";
import { toDateString } from "../src/lib/utils";

const kinds = ["books", "artists", "publishers"] as const;

async function run() {
  const dateArg = process.argv[2];
  const referenceDate = dateArg ? new Date(dateArg) : new Date();
  if (Number.isNaN(referenceDate.getTime())) {
    console.error("Invalid date. Use YYYY-MM-DD.");
    process.exit(1);
  }

  const edition = getCompletedNewsletterEditionRange(referenceDate);
  const editionKey = toDateString(edition.weekStart);
  console.log(
    "Rendering trending Instagram previews for edition",
    editionKey,
    "to",
    toDateString(edition.weekEnd),
  );

  const trending = await getTrendingForRange(edition.weekStart, edition.weekEnd);
  const captions = buildTrendingInstagramCaptions(trending);
  const outDir = join(process.cwd(), "output", `trending-instagram-${editionKey}`);
  mkdirSync(outDir, { recursive: true });

  for (const kind of kinds) {
    const items = trendingItemsForKind(kind, trending);
    if (items.length === 0) {
      console.log(`Skipping ${kind}: no trending items`);
      continue;
    }

    const slides = await renderTrendingCarouselSlides(kind, items);
    for (let index = 0; index < slides.length; index += 1) {
      const slide = slides[index];
      if (!slide) continue;
      const filePath = join(outDir, `${kind}-${index + 1}.webp`);
      writeFileSync(filePath, slide);
      console.log("Wrote:", filePath);
    }

    const captionPath = join(outDir, `${kind}-caption.txt`);
    writeFileSync(captionPath, captions[kind], "utf-8");
    console.log("Wrote:", captionPath);
  }

  console.log("Done:", outDir);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
