import sharp from "sharp";
import {
  buildTrendingSlideOverlaySvg,
  getSlideBackgroundColor,
  getSlideCoverMax,
  getSlideCoverTop,
} from "./slideThemes";
import {
  TRENDING_SLIDE_SIZE,
  type TrendingSlideInput,
  type TrendingSlideKind,
} from "./types";

export {
  buildTrendingSlideOverlaySvg,
  escapeXml,
  truncateForSlide,
} from "./slideThemes";
export { TRENDING_SLIDE_SIZE } from "./types";
export type { TrendingSlideInput, TrendingSlideKind } from "./types";

async function fetchImageBuffer(url: string): Promise<Buffer | null> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    if (!response.ok) return null;
    return Buffer.from(await response.arrayBuffer());
  } catch {
    return null;
  }
}

async function buildCoverLayer(coverUrl?: string | null): Promise<Buffer> {
  const coverMax = getSlideCoverMax();
  const coverBackground = getSlideBackgroundColor();
  const mat = sharp({
    create: {
      width: coverMax,
      height: coverMax,
      channels: 3,
      background: coverBackground,
    },
  });

  const source = coverUrl ? await fetchImageBuffer(coverUrl) : null;
  if (!source) {
    return mat.png().toBuffer();
  }

  const fitted = await sharp(source)
    .resize(coverMax, coverMax, { fit: "inside" })
    .toBuffer();

  return mat
    .composite([{ input: fitted, gravity: "centre" }])
    .png()
    .toBuffer();
}

export async function renderTrendingSlide(
  input: TrendingSlideInput,
): Promise<Buffer> {
  const overlay = Buffer.from(buildTrendingSlideOverlaySvg(input));
  const cover = await buildCoverLayer(input.coverUrl);
  const coverMax = getSlideCoverMax();
  const coverLeft = Math.floor((TRENDING_SLIDE_SIZE - coverMax) / 2);

  return sharp({
    create: {
      width: TRENDING_SLIDE_SIZE,
      height: TRENDING_SLIDE_SIZE,
      channels: 3,
      background: getSlideBackgroundColor(),
    },
  })
    .composite([
      { input: cover, top: getSlideCoverTop(), left: coverLeft },
      { input: overlay, top: 0, left: 0 },
    ])
    .webp({ quality: 90 })
    .toBuffer();
}

export async function renderTrendingCarouselSlides(
  kind: TrendingSlideKind,
  items: Array<{
    title: string;
    subtitle?: string | null;
    coverUrl?: string | null;
  }>,
): Promise<Buffer[]> {
  const slides: Buffer[] = [];
  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    if (!item) continue;
    slides.push(
      await renderTrendingSlide({
        kind,
        rank: (index + 1) as 1 | 2 | 3,
        title: item.title,
        subtitle: item.subtitle,
        coverUrl: item.coverUrl,
      }),
    );
  }
  return slides;
}
