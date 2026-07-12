import { readFileSync } from "node:fs";
import path from "node:path";
import type { TrendingSlideInput, TrendingSlideKind } from "./types";

const COLORS = {
  surface: "#fbfaf7",
  ink: "#191613",
  inkMuted: "#a39d90",
  accent: "#a22c29",
  onAccent: "#fbfaf7",
} as const;

const COVER_TOP = 196;
const COVER_MAX = 680;

const KIND_LABELS: Record<TrendingSlideKind, string> = {
  books: "Top books",
  artists: "Top artists",
  publishers: "Top publishers",
};

let fontCache: { sans600: string; display600: string } | null = null;

function fontDataUri(relativePath: string): string {
  const absolute = path.join(process.cwd(), relativePath);
  const buf = readFileSync(absolute);
  return `data:font/woff2;base64,${buf.toString("base64")}`;
}

function getFonts() {
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

export function getSlideBackgroundColor(): string {
  return COLORS.surface;
}

export function getSlideCoverTop(): number {
  return COVER_TOP;
}

export function getSlideCoverMax(): number {
  return COVER_MAX;
}

export function buildTrendingSlideOverlaySvg(input: TrendingSlideInput): string {
  const fonts = getFonts();
  const kicker = "Trending this week";
  const category = KIND_LABELS[input.kind];
  const title = truncateForSlide(input.title, 52);
  const subtitle = input.subtitle?.trim()
    ? truncateForSlide(input.subtitle, 60)
    : null;
  const titleY = subtitle ? 930 : 950;

  return `<svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
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
    </style>
  </defs>
  <rect width="100%" height="100%" fill="transparent"/>
  <text x="540" y="88" text-anchor="middle" fill="${COLORS.accent}" font-family="Instrument Sans" font-size="24" font-weight="600" letter-spacing="6">${escapeXml(kicker)}</text>
  <text x="540" y="132" text-anchor="middle" fill="${COLORS.ink}" font-family="Fraunces" font-size="44" font-weight="600">${escapeXml(category)}</text>
  <circle cx="120" cy="176" r="42" fill="${COLORS.accent}"/>
  <text x="120" y="188" text-anchor="middle" fill="${COLORS.onAccent}" font-family="Instrument Sans" font-size="34" font-weight="600">#${input.rank}</text>
  <text x="540" y="${titleY}" text-anchor="middle" fill="${COLORS.ink}" font-family="Fraunces" font-size="34" font-weight="600">${escapeXml(title)}</text>
  ${
    subtitle
      ? `<text x="540" y="972" text-anchor="middle" fill="${COLORS.inkMuted}" font-family="Instrument Sans" font-size="24" font-weight="600">${escapeXml(subtitle)}</text>`
      : ""
  }
  <text x="540" y="1048" text-anchor="middle" fill="${COLORS.inkMuted}" font-family="Instrument Sans" font-size="20" font-weight="600" letter-spacing="2">PHOTOBOOKERS.COM</text>
</svg>`;
}

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function truncateForSlide(value: string, maxLength: number): string {
  const trimmed = value.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 1).trimEnd()}…`;
}
