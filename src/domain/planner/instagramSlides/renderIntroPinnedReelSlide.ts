import sharp from "sharp";
import {
  escapeXml,
  getInstagramSlideFonts,
  INSTAGRAM_REEL_HEIGHT,
  INSTAGRAM_REEL_WIDTH,
  instagramSlideFontStyles,
} from "./shared";
import type { IntroPinnedSlide } from "./introPinnedPostContent";

const COLORS = {
  background: "#0a0a0a",
  kicker: "#a39d90",
  text: "#fbfaf7",
} as const;

const INTRO_REEL_BODY_FONT_SIZE = 44;
const INTRO_REEL_LINE_GAP = 14;
/** Keep copy inside Reel side safe zones (~96px inset each side at 1080). */
const INTRO_REEL_MAX_CHARS_PER_LINE = 28;

function wrapIntroReelLine(line: string, maxChars: number): string[] {
  if (line.length <= maxChars) return [line];

  const words = line.split(/\s+/);
  const wrapped: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars) {
      current = candidate;
      continue;
    }
    if (current) wrapped.push(current);
    current = word;
  }

  if (current) wrapped.push(current);
  return wrapped;
}

function wrapIntroReelLines(lines: string[]): string[] {
  return lines.flatMap((line) =>
    wrapIntroReelLine(line, INTRO_REEL_MAX_CHARS_PER_LINE),
  );
}

export function buildIntroPinnedReelSlideOverlaySvg(
  slide: IntroPinnedSlide,
): string {
  const fonts = getInstagramSlideFonts();
  const bodyLines = wrapIntroReelLines(slide.lines);
  const lineCount = bodyLines.length;
  const bodyFontSize = INTRO_REEL_BODY_FONT_SIZE;
  const blockHeight = lineCount * (bodyFontSize + INTRO_REEL_LINE_GAP);
  const centerX = INSTAGRAM_REEL_WIDTH / 2;
  const centerY = INSTAGRAM_REEL_HEIGHT / 2;
  const firstLineY = centerY - blockHeight / 2 + bodyFontSize;

  const bodySvg = bodyLines
    .map((line, index) => {
      const y = firstLineY + index * (bodyFontSize + INTRO_REEL_LINE_GAP);
      return `<text x="${centerX}" y="${y}" text-anchor="middle" fill="${COLORS.text}" font-family="Fraunces" font-size="${bodyFontSize}" font-weight="600">${escapeXml(line)}</text>`;
    })
    .join("\n  ");

  return `<svg width="${INSTAGRAM_REEL_WIDTH}" height="${INSTAGRAM_REEL_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>${instagramSlideFontStyles(fonts)}</style>
  </defs>
  <rect width="100%" height="100%" fill="${COLORS.background}"/>
  <text x="${centerX}" y="360" text-anchor="middle" fill="${COLORS.kicker}" font-family="Instrument Sans" font-size="24" font-weight="600" letter-spacing="4">${escapeXml(slide.kicker.toUpperCase())}</text>
  ${bodySvg}
</svg>`;
}

export async function renderIntroPinnedReelSlide(
  slide: IntroPinnedSlide,
): Promise<Buffer> {
  const overlay = Buffer.from(buildIntroPinnedReelSlideOverlaySvg(slide));

  return sharp({
    create: {
      width: INSTAGRAM_REEL_WIDTH,
      height: INSTAGRAM_REEL_HEIGHT,
      channels: 3,
      background: COLORS.background,
    },
  })
    .composite([{ input: overlay, top: 0, left: 0 }])
    .png()
    .toBuffer();
}

export async function renderIntroPinnedReelCarouselSlides(
  slides: IntroPinnedSlide[],
): Promise<Buffer[]> {
  return Promise.all(slides.map((slide) => renderIntroPinnedReelSlide(slide)));
}
