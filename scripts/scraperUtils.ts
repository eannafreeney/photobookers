import { ilike } from "drizzle-orm";
import { creators } from "../src/db/schema";
import { db } from "../src/db/client";

/** Delimiter used by all scrapers. Import script detects comma via first line. */
export const CSV_DELIMITER = ",";

/**
 * Escapes a value for CSV: quotes when it contains the delimiter, quote char, or newlines,
 * and doubles internal double quotes (so titles/descriptions with commas are safe).
 */
export function escapeCsv(
  value: string,
  delimiter: string = CSV_DELIMITER,
): string {
  const s = String(value ?? "");
  if (
    s.includes('"') ||
    s.includes(delimiter) ||
    s.includes("\n") ||
    s.includes("\r")
  ) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/**
 * Turns a row object into a single CSV line using the shared delimiter.
 */
export function rowToCsv(row: Record<string, string | boolean>): string {
  return Object.values(row)
    .map((v) => escapeCsv(String(v)))
    .join(CSV_DELIMITER);
}

export async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": "PhotobookersScraper/1.0" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.text();
}

export function normalizeUrl(url: string, base: string): string {
  if (url.startsWith("//")) return `https:${url}`;
  if (url.startsWith("/")) return `${base}${url}`;
  return url;
}

export async function artistExistsInDb(artistName: string): Promise<boolean> {
  const trimmed = artistName.trim();
  if (!trimmed) return false;
  try {
    const rows = await db
      .select({ id: creators.id })
      .from(creators)
      .where(ilike(creators.displayName, trimmed))
      .limit(1);
    return rows.length > 0;
  } catch {
    throw new Error(`Failed to check if artist exists in db: ${artistName}`);
  }
}

export function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'");
}
