/**
 * TIS books scraper
 * Fetches product URLs from:
 *   - https://www.tisbooks.pub/collections/standard-editions
 *   - https://www.tisbooks.pub/collections/tis-series
 * Then scrapes each product page and writes CSV: title, artist, artistExistsInDb,
 * description, specs, coverUrl, images, availability, purchaseLink
 *
 * Run: npx tsx scripts/scrapers/scrape-tisbooks.ts [output-path]
 */
import "../../scripts/env";
import * as cheerio from "cheerio";
import { ilike } from "drizzle-orm";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { db } from "../../src/db/client";
import { creators } from "../../src/db/schema";

const BASE = "https://www.tisbooks.pub";
const COLLECTION_URLS = [
  `${BASE}/collections/standard-editions`,
  `${BASE}/collections/tis-series`,
];

function escapeCsv(value: string): string {
  const s = String(value ?? "");
  if (
    s.includes('"') ||
    s.includes(",") ||
    s.includes("\n") ||
    s.includes("\r")
  ) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function rowToCsv(row: Record<string, string | boolean>): string {
  return Object.values(row)
    .map((v) => escapeCsv(String(v)))
    .join(",");
}

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": "PhotobookersScraper/1.0" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.text();
}

function normalizeUrl(url: string): string {
  if (url.startsWith("//")) return `https:${url}`;
  if (url.startsWith("/")) return `${BASE}${url}`;
  return url;
}

/** Collect product URLs from one collection page HTML */
function getProductUrlsFromHtml(html: string): string[] {
  const $ = cheerio.load(html);
  const urls: string[] = [];
  $('a[href*="/products/"]').each((_, el) => {
    const href = $(el).attr("href");
    if (href) {
      const full = normalizeUrl(href.split("?")[0]);
      if (!urls.includes(full)) urls.push(full);
    }
  });
  return urls;
}

/** Fetch both collection pages and return deduplicated product URLs */
async function getAllProductUrls(): Promise<string[]> {
  const seen = new Set<string>();
  const all: string[] = [];

  for (const url of COLLECTION_URLS) {
    console.log(`Fetching collection: ${url}`);
    const html = await fetchHtml(url);
    const urls = getProductUrlsFromHtml(html);
    for (const u of urls) {
      if (!seen.has(u)) {
        seen.add(u);
        all.push(u);
      }
    }
  }
  return all;
}

async function artistExistsInDb(artistName: string): Promise<boolean> {
  const trimmed = artistName.trim();
  if (!trimmed) return false;
  const rows = await db
    .select({ id: creators.id })
    .from(creators)
    .where(ilike(creators.displayName, trimmed))
    .limit(1);
  return rows.length > 0;
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
  const html = await fetchHtml(productUrl);
  const $ = cheerio.load(html);

  const title =
    $("h1.product_title_custom__title").first().text().trim() ||
    $("h1").first().text().trim() ||
    $('meta[property="og:title"]').attr("content")?.trim() ||
    "";

  const artist =
    $("h2.product_title_custom__author").first().text().trim() ||
    $(".product_title_custom__author").first().text().trim() ||
    "";

  const description =
    $('[data-block-type="description"] .prose').first().text().trim() ||
    $('.product-info__block-item[data-block-type="description"] .prose')
      .first()
      .text()
      .trim() ||
    $('meta[name="description"]').attr("content")?.trim() ||
    $(".product__description, .rte, [class*='description']")
      .first()
      .text()
      .trim() ||
    "";

  const specs =
    $(".prose .metafield-rich_text_field")
      .first()
      .text()
      .replace(/\s*\n\s*/g, "; ")
      .trim() || "";

  const imageUrls: string[] = [];
  $(
    ".product__media img[src], .product-gallery img[src], [class*='product'] img[src]",
  ).each((_, el) => {
    const src = $(el).attr("src");
    if (src && !src.startsWith("data:")) imageUrls.push(normalizeUrl(src));
  });
  if (imageUrls.length === 0) {
    const ogImage = $('meta[property="og:image"]').attr("content");
    if (ogImage) imageUrls.push(normalizeUrl(ogImage));
  }
  const uniqueImages = [...new Set(imageUrls)];
  const coverUrl = uniqueImages[0] ?? "";
  const maxExtra = 5;
  const images = uniqueImages.slice(1, 1 + maxExtra).join("|");

  const purchaseLink =
    $('link[rel="canonical"]').attr("href")?.trim() || productUrl;

  const artistExists = await artistExistsInDb(artist);

  return {
    title,
    artist,
    artistExistsInDb: artistExists,
    description,
    coverUrl,
    images,
    availability: "available",
    purchaseLink: purchaseLink.startsWith("http")
      ? purchaseLink
      : normalizeUrl(purchaseLink),
  };
}

async function main() {
  const outPath =
    process.argv[2] ?? join(process.cwd(), "output", "tisbooks-books.csv");

  console.log("Fetching product URLs from both collections...");
  const productUrls = await getAllProductUrls();
  console.log(`Found ${productUrls.length} product URLs.`);

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

  for (let i = 0; i < productUrls.length; i++) {
    const url = productUrls[i];
    console.log(`[${i + 1}/${productUrls.length}] ${url}`);
    try {
      const row = await scrapeProduct(url);
      lines.push(rowToCsv({ ...row, artistExistsInDb: row.artistExistsInDb }));
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
