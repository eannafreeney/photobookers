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
};

function buildBotdStoryOverlaySvg(meta: BotdStorySlideMeta): string {
  const fonts = getInstagramSlideFonts();
  const title = truncateInstagramSlideText(meta.title, 56);
  const artist = meta.artistName?.trim()
    ? truncateInstagramSlideText(meta.artistName, 60)
    : null;

  return `<svg width="${INSTAGRAM_REEL_WIDTH}" height="${INSTAGRAM_REEL_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>${instagramSlideFontStyles(fonts)}</style>
    <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="rgba(0,0,0,0.38)"/>
      <stop offset="0.28" stop-color="rgba(0,0,0,0)"/>
      <stop offset="0.72" stop-color="rgba(0,0,0,0)"/>
      <stop offset="1" stop-color="rgba(0,0,0,0.58)"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#fade)"/>
  <text x="${INSTAGRAM_REEL_WIDTH / 2}" y="220" text-anchor="middle" fill="${INSTAGRAM_SLIDE_COLORS.surface}" font-family="Instrument Sans" font-size="34" font-weight="600" letter-spacing="6" opacity="0.94">BOOK OF THE DAY</text>
  <text x="${INSTAGRAM_REEL_WIDTH / 2}" y="1600" text-anchor="middle" fill="${INSTAGRAM_SLIDE_COLORS.surface}" font-family="Fraunces" font-size="64" font-weight="600">${escapeXml(title)}</text>
  ${artist ? `<text x="${INSTAGRAM_REEL_WIDTH / 2}" y="1672" text-anchor="middle" fill="#e8e2d6" font-family="Instrument Sans" font-size="36" font-weight="600">${escapeXml(artist)}</text>` : ""}
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
