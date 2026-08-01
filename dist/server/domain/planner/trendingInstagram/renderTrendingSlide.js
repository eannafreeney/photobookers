import sharp from "sharp";
import {
  buildTrendingSlideOverlaySvg,
  getSlideBackgroundColor,
  getSlideCoverMax,
  getSlideCoverTop
} from "./slideThemes.js";
import {
  TRENDING_SLIDE_SIZE
} from "./types.js";
import {
  buildTrendingSlideOverlaySvg as buildTrendingSlideOverlaySvg2,
  escapeXml,
  truncateForSlide
} from "./slideThemes.js";
import { TRENDING_SLIDE_SIZE as TRENDING_SLIDE_SIZE2 } from "./types.js";
async function fetchImageBuffer(url) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(15e3) });
    if (!response.ok) return null;
    return Buffer.from(await response.arrayBuffer());
  } catch {
    return null;
  }
}
async function buildCoverLayer(coverUrl) {
  const coverMax = getSlideCoverMax();
  const coverBackground = getSlideBackgroundColor();
  const mat = sharp({
    create: {
      width: coverMax,
      height: coverMax,
      channels: 3,
      background: coverBackground
    }
  });
  const source = coverUrl ? await fetchImageBuffer(coverUrl) : null;
  if (!source) {
    return mat.png().toBuffer();
  }
  const fitted = await sharp(source).resize(coverMax, coverMax, { fit: "inside" }).toBuffer();
  return mat.composite([{ input: fitted, gravity: "centre" }]).png().toBuffer();
}
async function renderTrendingSlide(input) {
  const overlay = Buffer.from(buildTrendingSlideOverlaySvg(input));
  const cover = await buildCoverLayer(input.coverUrl);
  const coverMax = getSlideCoverMax();
  const coverLeft = Math.floor((TRENDING_SLIDE_SIZE - coverMax) / 2);
  return sharp({
    create: {
      width: TRENDING_SLIDE_SIZE,
      height: TRENDING_SLIDE_SIZE,
      channels: 3,
      background: getSlideBackgroundColor()
    }
  }).composite([
    { input: cover, top: getSlideCoverTop(), left: coverLeft },
    { input: overlay, top: 0, left: 0 }
  ]).webp({ quality: 90 }).toBuffer();
}
async function renderTrendingCarouselSlides(kind, items) {
  const slides = [];
  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    if (!item) continue;
    slides.push(
      await renderTrendingSlide({
        kind,
        rank: index + 1,
        title: item.title,
        subtitle: item.subtitle,
        coverUrl: item.coverUrl
      })
    );
  }
  return slides;
}
export {
  TRENDING_SLIDE_SIZE2 as TRENDING_SLIDE_SIZE,
  buildTrendingSlideOverlaySvg2 as buildTrendingSlideOverlaySvg,
  escapeXml,
  renderTrendingCarouselSlides,
  renderTrendingSlide,
  truncateForSlide
};
