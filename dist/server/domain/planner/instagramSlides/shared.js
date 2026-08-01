import { readFileSync } from "node:fs";
import path from "node:path";
const INSTAGRAM_SLIDE_SIZE = 1080;
const INSTAGRAM_REEL_WIDTH = 1080;
const INSTAGRAM_REEL_HEIGHT = 1920;
const INSTAGRAM_SLIDE_COVER_TOP = 196;
const INSTAGRAM_SLIDE_COVER_MAX = 680;
const INSTAGRAM_SLIDE_COLORS = {
  surface: "#fbfaf7",
  ink: "#191613",
  inkMuted: "#a39d90",
  accent: "#a22c29",
  onAccent: "#fbfaf7"
};
let fontCache = null;
function fontDataUri(relativePath) {
  const absolute = path.join(process.cwd(), relativePath);
  const buf = readFileSync(absolute);
  return `data:font/woff2;base64,${buf.toString("base64")}`;
}
function getInstagramSlideFonts() {
  if (!fontCache) {
    fontCache = {
      sans600: fontDataUri(
        "node_modules/@fontsource/instrument-sans/files/instrument-sans-latin-600-normal.woff2"
      ),
      display600: fontDataUri(
        "node_modules/@fontsource/fraunces/files/fraunces-latin-600-normal.woff2"
      )
    };
  }
  return fontCache;
}
function escapeXml(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
async function fetchInstagramSlideImage(url) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(15e3) });
    if (!response.ok) return null;
    return Buffer.from(await response.arrayBuffer());
  } catch {
    return null;
  }
}
function instagramSlideFontStyles(fonts) {
  return `
    @font-face {
      font-family: "Instrument Sans";
      src: url("${fonts.sans600}") format("woff2");
      font-weight: 600;
    }
    @font-face {
      font-family: "Fraunces";
      src: url("${fonts.display600}") format("woff2");
      font-weight: 600;
    }
  `;
}
function truncateInstagramSlideText(value, maxLength) {
  const trimmed = value.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 1).trimEnd()}\u2026`;
}
export {
  INSTAGRAM_REEL_HEIGHT,
  INSTAGRAM_REEL_WIDTH,
  INSTAGRAM_SLIDE_COLORS,
  INSTAGRAM_SLIDE_COVER_MAX,
  INSTAGRAM_SLIDE_COVER_TOP,
  INSTAGRAM_SLIDE_SIZE,
  escapeXml,
  fetchInstagramSlideImage,
  getInstagramSlideFonts,
  instagramSlideFontStyles,
  truncateInstagramSlideText
};
