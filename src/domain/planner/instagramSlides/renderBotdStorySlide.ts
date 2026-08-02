import sharp from "sharp";
import {
  escapeXml,
  fetchInstagramSlideImage,
  getInstagramSlideFonts,
  INSTAGRAM_REEL_HEIGHT,
  INSTAGRAM_REEL_WIDTH,
  INSTAGRAM_SLIDE_COLORS,
  instagramSlideFontStyles,
  truncateInstagramSlideText,
} from "./shared";

export type BotdStorySlideMeta = {
  title: string;
  artistName?: string | null;
  publisherName?: string | null;
  label?: string;
};

function buildBotdStoryOverlaySvg(meta: BotdStorySlideMeta): string {
  const fonts = getInstagramSlideFonts();
  const title = truncateInstagramSlideText(meta.title, 56);
  const credits = [meta.artistName, meta.publisherName]
    .filter(Boolean)
    .map((name) => truncateInstagramSlideText(name!, 40));
  const creditsLine = credits.length > 0 ? credits.join(" · ") : null;

  return `<svg width="${INSTAGRAM_REEL_WIDTH}" height="${INSTAGRAM_REEL_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>${instagramSlideFontStyles(fonts)}</style>
    <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="rgba(0,0,0,0.45)"/>
      <stop offset="0.35" stop-color="rgba(0,0,0,0)"/>
      <stop offset="0.72" stop-color="rgba(0,0,0,0)"/>
      <stop offset="1" stop-color="rgba(0,0,0,0.2)"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#fade)"/>
  <text x="80" y="180" text-anchor="start" fill="${INSTAGRAM_SLIDE_COLORS.surface}" font-family="Instrument Sans" font-size="34" font-weight="600" letter-spacing="6" opacity="0.94">${escapeXml(meta.label ?? "BOOK OF THE DAY")}</text>
  <text x="80" y="270" text-anchor="start" fill="${INSTAGRAM_SLIDE_COLORS.surface}" font-family="Fraunces" font-size="56" font-weight="600">${escapeXml(title)}</text>
  ${creditsLine ? `<text x="80" y="340" text-anchor="start" fill="#e8e2d6" font-family="Instrument Sans" font-size="34" font-weight="600">${escapeXml(creditsLine)}</text>` : ""}
</svg>`;
}

/**
 * Full-bleed 9:16 story slide. Uses the artist-provided vertical image.
 */
export async function renderBotdStoryFullBleed(
  imageUrl: string,
  meta: BotdStorySlideMeta,
): Promise<Buffer> {
  const source = await fetchInstagramSlideImage(imageUrl);
  const base = source
    ? sharp(source).resize(INSTAGRAM_REEL_WIDTH, INSTAGRAM_REEL_HEIGHT, {
        fit: "cover",
        position: "attention",
      })
    : sharp({
        create: {
          width: INSTAGRAM_REEL_WIDTH,
          height: INSTAGRAM_REEL_HEIGHT,
          channels: 3,
          background: INSTAGRAM_SLIDE_COLORS.ink,
        },
      });

  return base
    .composite([
      { input: Buffer.from(buildBotdStoryOverlaySvg(meta)), top: 0, left: 0 },
    ])
    .webp({ quality: 90 })
    .toBuffer();
}

/**
 * 9:16 story slide for landscape/4:5 spreads: sharp image centered over a
 * blurred, darkened fill of itself (Option B).
 */
export async function renderBotdStoryBlurred(
  imageUrl: string,
  meta: BotdStorySlideMeta,
): Promise<Buffer> {
  const source = await fetchInstagramSlideImage(imageUrl);
  const bg = source
    ? sharp(source)
        .resize(INSTAGRAM_REEL_WIDTH, INSTAGRAM_REEL_HEIGHT, { fit: "cover" })
        .blur(40)
        .modulate({ brightness: 0.72 })
    : sharp({
        create: {
          width: INSTAGRAM_REEL_WIDTH,
          height: INSTAGRAM_REEL_HEIGHT,
          channels: 3,
          background: INSTAGRAM_SLIDE_COLORS.ink,
        },
      });

  const bgBuffer = await bg.toBuffer();

  let composites: sharp.OverlayOptions[] = [];
  if (source) {
    const fgWidth = 860;
    const fg = await sharp(source)
      .resize({ width: fgWidth })
      .extend({
        top: 3,
        bottom: 3,
        left: 3,
        right: 3,
        background: INSTAGRAM_SLIDE_COLORS.surface,
      })
      .toBuffer();
    const fgMeta = await sharp(fg).metadata();
    composites.push({
      input: fg,
      top: Math.round((INSTAGRAM_REEL_HEIGHT - (fgMeta.height ?? 0)) / 2) - 60,
      left: Math.round((INSTAGRAM_REEL_WIDTH - (fgMeta.width ?? 0)) / 2),
    });
  }

  composites.push({
    input: Buffer.from(buildBotdStoryOverlaySvg(meta)),
    top: 0,
    left: 0,
  });

  return sharp(bgBuffer)
    .composite(composites)
    .webp({ quality: 90 })
    .toBuffer();
}
