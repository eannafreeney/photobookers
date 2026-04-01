/**
 * Hoxton Mini Press scraper (collection product pages)
 *
 * Target pages:
 * - https://www.hoxtonminipress.com/collections/photography/products/<handle>
 *
 * Extracts:
 * - title: h1.product_name
 * - description: .description
 * - artist: parsed from first emphasized line when it contains "by", else ""
 *
 * Run:
 *   npx tsx scripts/scrapers/hoxton-collection-products.ts [output-path]
 */

import * as cheerio from "cheerio";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";

const BASE = "https://www.hoxtonminipress.com";
const COLLECTION_URL = `${BASE}/collections/photography`;

type Row = {
  url: string;
  title: string;
  description: string;
  artist: string;
  coverUrl: string;
  images: string;
};

const CSV_DELIMITER = ",";

function escapeCsv(value: string): string {
  const s = String(value ?? "");
  if (
    s.includes('"') ||
    s.includes(CSV_DELIMITER) ||
    s.includes("\n") ||
    s.includes("\r")
  ) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function rowToCsv(row: Record<string, string>): string {
  return Object.values(row).map(escapeCsv).join(CSV_DELIMITER);
}

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": "PhotobookersScraper/1.0" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.text();
}

function normalizeUrl(url: string, base: string): string {
  if (url.startsWith("//")) return `https:${url}`;
  if (url.startsWith("/")) return `${base}${url}`;
  return url;
}

function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'");
}

function extractArtistFromDescription($: cheerio.CheerioAPI): string {
  const firstEm = $(".description em").first().text().trim();
  if (!firstEm) return "";

  const byMatch = firstEm.match(/\bby\s+(.+)$/i);
  return byMatch?.[1]?.trim() ?? "";
}

function htmlToCleanText(html: string): string {
  return decodeHtmlEntities(html)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*/gi, "\n\n")
    .replace(/<p[^>]*>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

async function getProductUrls(): Promise<string[]> {
  const html = await fetchHtml(COLLECTION_URL);
  const $ = cheerio.load(html);
  const urls = new Set<string>();

  $('a[href*="/collections/photography/products/"]').each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;

    const full = normalizeUrl(href.split("?")[0], BASE);
    const path = new URL(full).pathname;
    const match = path.match(/^\/collections\/photography\/products\/[^/]+$/);
    if (!match) return;
    urls.add(`${BASE}${path}`);
  });

  return [...urls];
}

async function scrapeProduct(url: string): Promise<Row> {
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);

  const title = $("h1.product_name").first().text().trim();
  const descriptionHtml = $(".description").first().html() ?? "";
  const description = htmlToCleanText(descriptionHtml);
  const artist = extractArtistFromDescription($);
  const imageUrls: string[] = [];

  $(
    ".product_gallery img, .product__media img, .product-photo-container img, [data-product-images] img, .product img",
  ).each((_, el) => {
    const src =
      $(el).attr("data-src") || $(el).attr("data-zoom") || $(el).attr("src");
    if (!src || src.startsWith("data:")) return;
    imageUrls.push(normalizeUrl(src, BASE));
  });

  if (imageUrls.length === 0) {
    const ogImage = $('meta[property="og:image"]').attr("content");
    if (ogImage) imageUrls.push(normalizeUrl(ogImage, BASE));
  }

  const uniqueImages = [...new Set(imageUrls)];
  const coverUrl = uniqueImages[0] ?? "";
  const images = uniqueImages.slice(1).join("|");

  return {
    url,
    title,
    description,
    artist,
    coverUrl,
    images,
  };
}

async function main() {
  const outPath =
    process.argv[2] ??
    join(process.cwd(), "output", "hoxton-collection-products.csv");

  console.log("Fetching collection...");
  const urls = await getProductUrls();
  console.log(`Found ${urls.length} product pages.`);

  const lines = [
    rowToCsv({
      url: "url",
      title: "title",
      description: "description",
      artist: "artist",
      coverUrl: "coverUrl",
      images: "images",
    }),
  ];

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    console.log(`[${i + 1}/${urls.length}] ${url}`);
    try {
      const row = await scrapeProduct(url);
      lines.push(rowToCsv(row));
    } catch (error) {
      console.error(`Error scraping ${url}:`, error);
    }
  }

  await mkdir(join(outPath, ".."), { recursive: true });
  await writeFile(outPath, lines.join("\n"), "utf8");
  console.log(`Wrote ${lines.length - 1} rows to ${outPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

