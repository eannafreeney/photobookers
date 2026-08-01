import sharp from "sharp";
import {
  escapeXml,
  getInstagramSlideFonts,
  INSTAGRAM_SLIDE_SIZE,
  instagramSlideFontStyles
} from "./shared.js";
const COLORS = {
  background: "#0a0a0a",
  kicker: "#a39d90",
  text: "#fbfaf7"
};
const INTRO_PINNED_BODY_FONT_SIZE = 44;
function buildIntroPinnedSlideOverlaySvg(slide) {
  const fonts = getInstagramSlideFonts();
  const lineCount = slide.lines.length;
  const bodyFontSize = INTRO_PINNED_BODY_FONT_SIZE;
  const blockHeight = lineCount * (bodyFontSize + 14);
  const firstLineY = 540 - blockHeight / 2 + bodyFontSize;
  const bodyLines = slide.lines.map((line, index) => {
    const y = firstLineY + index * (bodyFontSize + 14);
    return `<text x="540" y="${y}" text-anchor="middle" fill="${COLORS.text}" font-family="Fraunces" font-size="${bodyFontSize}" font-weight="600">${escapeXml(line)}</text>`;
  }).join("\n  ");
  return `<svg width="${INSTAGRAM_SLIDE_SIZE}" height="${INSTAGRAM_SLIDE_SIZE}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>${instagramSlideFontStyles(fonts)}</style>
  </defs>
  <rect width="100%" height="100%" fill="${COLORS.background}"/>
  <text x="540" y="120" text-anchor="middle" fill="${COLORS.kicker}" font-family="Instrument Sans" font-size="24" font-weight="600" letter-spacing="4">${escapeXml(slide.kicker.toUpperCase())}</text>
  ${bodyLines}
</svg>`;
}
async function renderIntroPinnedSlide(slide) {
  const overlay = Buffer.from(buildIntroPinnedSlideOverlaySvg(slide));
  return sharp({
    create: {
      width: INSTAGRAM_SLIDE_SIZE,
      height: INSTAGRAM_SLIDE_SIZE,
      channels: 3,
      background: COLORS.background
    }
  }).composite([{ input: overlay, top: 0, left: 0 }]).webp({ quality: 92 }).toBuffer();
}
async function renderIntroPinnedCarouselSlides(slides) {
  return Promise.all(slides.map((slide) => renderIntroPinnedSlide(slide)));
}
export {
  buildIntroPinnedSlideOverlaySvg,
  renderIntroPinnedCarouselSlides,
  renderIntroPinnedSlide
};
