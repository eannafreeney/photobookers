import { readFileSync } from "node:fs";
import path from "node:path";

export const INSTAGRAM_SLIDE_SIZE = 1080;
/** 9:16 — native Reel / vertical carousel dimensions */
export const INSTAGRAM_REEL_WIDTH = 1080;
export const INSTAGRAM_REEL_HEIGHT = 1920;

export const INSTAGRAM_SLIDE_COVER_TOP = 196;
export const INSTAGRAM_SLIDE_COVER_MAX = 680;

export const INSTAGRAM_SLIDE_COLORS = {
  surface: "#fbfaf7",
  ink: "#191613",
  inkMuted: "#a39d90",
  accent: "#a22c29",
  onAccent: "#fbfaf7",
} as const;

let fontCache: { sans600: string; display600: string } | null = null;

function fontDataUri(relativePath: string): string {
  const absolute = path.join(process.cwd(), relativePath);
  const buf = readFileSync(absolute);
  return `data:font/woff2;base64,${buf.toString("base64")}`;
}

export function getInstagramSlideFonts() {
  if (!fontCache) {
    fontCache = {
      sans600: fontDataUri(
        "node_modules/@fontsource/instrument-sans/files/instrument-sans-latin-600-normal.woff2",
      ),
      display600: fontDataUri(
        "node_modules/@fontsource/fraunces/files/fraunces-latin-600-normal.woff2",
      ),
    };
  }
  return fontCache;
}

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function fetchInstagramSlideImage(
  url: string,
): Promise<Buffer | null> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    if (!response.ok) return null;
    return Buffer.from(await response.arrayBuffer());
  } catch {
    return null;
  }
}

export function instagramSlideFontStyles(
  fonts: ReturnType<typeof getInstagramSlideFonts>,
): string {
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

export function truncateInstagramSlideText(
  value: string,
  maxLength: number,
): string {
  const trimmed = value.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 1).trimEnd()}…`;
}
