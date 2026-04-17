/**
 * At Last Books scraper
 * Site: https://www.atlastbooks.com/
 *
 * Field mapping (h1.product-title format: "Artist — Book Title"):
 * - title:       part after the em/en dash in h1.product-title
 * - artist:      part before the em/en dash in h1.product-title
 * - description: .product-description (first occurrence, desktop variant)
 *
 * CSV output columns:
 *   - title
 *   - artist
 *   - artistExistsInDb
 *   - description
 *   - coverUrl
 *   - images (gallery URLs separated by "|", excluding coverUrl)
 *   - availability ("sold out" | "available")
 *   - purchaseLink
 *
 * Run:
 *   npx tsx scripts/scrapers/atlastbooks.ts [output-path] [amount]
 */
import "../env";

import * as cheerio from "cheerio";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import {
  artistExistsInDb,
  decodeHtmlEntities,
  fetchHtml,
  normalizeUrl,
  rowToCsv,
} from "../scraperUtils";

const BASE = "https://www.atlastbooks.com";
const LISTING_URL = `${BASE}/`;

// Squarespace blocks scrapers without a real User-Agent header.
// fetchHtml uses "PhotobookersScraper/1.0" which gets blocked,
// so we override with a browser UA for this site.
async function fetchPage(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.text();
}

function cleanWhitespace(s: string): string {
  return (s ?? "").replace(/\s+/g, " ").trim();
}

function uniqPreserveOrder(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of values) {
    if (!v) continue;
    if (seen.has(v)) continue;
    seen.add(v);
    out.push(v);
  }
  return out;
}

/** Split "Artist — Title" or "Artist – Title" into [artist, title]. */
function splitArtistTitle(raw: string): { artist: string; title: string } {
  // Prefer em dash (—, \u2014), then en dash (–, \u2013), then plain hyphen-space
  const separators = [" \u2014 ", " \u2013 ", " - "];
  for (const sep of separators) {
    const idx = raw.indexOf(sep);
    if (idx !== -1) {
      return {
        artist: cleanWhitespace(raw.slice(0, idx)),
        title: cleanWhitespace(raw.slice(idx + sep.length)),
      };
    }
  }
  // No separator found – treat the whole thing as the title
  return { artist: "", title: cleanWhitespace(raw) };
}

function getProductUrlsFromListing(html: string): string[] {
  const $ = cheerio.load(html);
  const seen = new Set<string>();
  const urls: string[] = [];

  $('a[href*="/books/p/"]').each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;

    const withoutQuery = href.split("?")[0].trim();
    const full = normalizeUrl(withoutQuery, BASE);

    try {
      const { pathname } = new URL(full);
      if (!/^\/books\/p\/[^/]+\/?$/.test(pathname)) return;
    } catch {
      return;
    }

    const normalized = full.replace(/\/$/, "");
    if (seen.has(normalized)) return;
    seen.add(normalized);
    urls.push(normalized);
  });

  return uniqPreserveOrder(urls);
}

function extractDescription($: cheerio.CheerioAPI): string {
  // Use the desktop variant (.hidden-down-md); fall back to any .product-description
  const block =
    $(".product-description.hidden-down-md").first() ||
    $(".product-description").first();

  if (!block.length) return "";

  const clone = block.clone();
  clone.find("script, style").remove();

  const paragraphs = clone
    .find("p")
    .toArray()
    .map((p) => cleanWhitespace(decodeHtmlEntities($(p).text())))
    .filter(Boolean);

  if (paragraphs.length > 0) return paragraphs.join("\n\n");
  return cleanWhitespace(decodeHtmlEntities(clone.text()));
}

function extractImageUrls($: cheerio.CheerioAPI): string[] {
  const urls: string[] = [];

  const push = (value: string | undefined | null) => {
    if (!value) return;
    const normalized = value.trim();
    if (!normalized || normalized.startsWith("data:")) return;
    const full = normalized.startsWith("//")
      ? `https:${normalized}`
      : normalized;
    urls.push(full);
  };

  // Gallery thumbnails carry the full-res src in data-src
  $(".product-gallery-thumbnails-item-image[data-src]").each((_, el) => {
    push($(el).attr("data-src"));
  });

  // Slide images as secondary source
  if (urls.length === 0) {
    $(".product-gallery-slides-item-image[data-src]").each((_, el) => {
      push($(el).attr("data-src"));
    });
  }

  // OG image as last resort
  if (urls.length === 0) {
    push($('meta[property="og:image"]').attr("content"));
  }

  return uniqPreserveOrder(urls);
}

async function scrapeProduct(productUrl: string): Promise<{
  title: string;
  artist: string;
  artistExistsInDb: boolean;
  description: string;
  coverUrl: string;
  images: string;
  availability: string;
  purchaseLink: string;
}> {
  const html = await fetchPage(productUrl);
  const $ = cheerio.load(html);

  const rawTitle = cleanWhitespace($("h1.product-title").first().text());
  const { artist, title } = splitArtistTitle(rawTitle);

  const description = extractDescription($);

  const imageUrls = extractImageUrls($);
  const coverUrl = imageUrls[0] ?? "";
  const images = imageUrls.slice(1).join("|");

  // Availability: meta tag is the most reliable source
  const metaAvailability = $('meta[property="product:availability"]')
    .attr("content")
    ?.toLowerCase();
  const bodyLower = $("body").text().toLowerCase();
  const soldOut =
    metaAvailability === "oos" ||
    metaAvailability === "outofstock" ||
    bodyLower.includes("sold out") ||
    $(".product-mark.sold-out, .sold-out-product-message").length > 0;
  const availability = soldOut ? "sold out" : "available";

  const canonical = cleanWhitespace(
    $('link[rel="canonical"]').attr("href") ?? "",
  );
  const purchaseLink = canonical || productUrl;

  const artistExists = artist ? await artistExistsInDb(artist) : false;

  return {
    title,
    artist,
    artistExistsInDb: artistExists,
    description,
    coverUrl,
    images,
    availability,
    purchaseLink,
  };
}

async function main() {
  const outPath =
    process.argv[2] ?? join(process.cwd(), "output", "atlastbooks.csv");
  const amountArg = process.argv[3];
  const amount = amountArg ? Math.max(0, Number(amountArg)) : Infinity;

  console.log(`Fetching listing: ${LISTING_URL}`);
  const listingHtml = await fetchPage(LISTING_URL);
  const allUrls = getProductUrlsFromListing(listingHtml);

  const finalUrls =
    amount === Infinity ? allUrls : allUrls.slice(0, amount);

  console.log(
    `Found ${allUrls.length} product URLs. Scraping ${finalUrls.length}...`,
  );

  const header: Record<string, string> = {
    title: "title",
    artist: "artist",
    artistExistsInDb: "artistExistsInDb",
    description: "description",
    coverUrl: "coverUrl",
    images: "images",
    availability: "availability",
    purchaseLink: "purchaseLink",
  };

  const lines: string[] = [rowToCsv(header)];

  for (let i = 0; i < finalUrls.length; i++) {
    const url = finalUrls[i];
    console.log(`[${i + 1}/${finalUrls.length}] ${url}`);

    try {
      const row = await scrapeProduct(url);
      lines.push(rowToCsv(row));
    } catch (err) {
      console.error(`Error scraping ${url}:`, err);
    }
  }

  await mkdir(join(outPath, ".."), { recursive: true });
  await writeFile(outPath, lines.join("\n"), "utf8");
  console.log(`Wrote ${lines.length - 1} rows to ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
