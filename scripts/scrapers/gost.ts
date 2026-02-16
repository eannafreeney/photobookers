/**
 * GOST Books scraper
 * Fetches product URLs from the paginated collection:
 *   https://gostbooks.com/collections/current-books
 *   https://gostbooks.com/collections/current-books?page=2
 * Then scrapes each product page and writes CSV: title, artist, artistExistsInDb,
 * description, specs, coverUrl, images, availability, purchaseLink
 *
 * Run: npx tsx scripts/scrapers/gostbooks.ts [output-path]
 */

import * as cheerio from "cheerio";
import { ilike } from "drizzle-orm";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { db } from "../../src/db/client";
import { creators } from "../../src/db/schema";

const BASE = "https://gostbooks.com";
const COLLECTION_BASE = `${BASE}/collections/current-books`;
const AMOUNT_OF_BOOKS = 3;

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

/** Fetch all collection pages (page=1, page=2, ...) until a page has no new product URLs */
async function getAllProductUrls(): Promise<string[]> {
  const seen = new Set<string>();
  const all: string[] = [];
  let page = 1;

  for (;;) {
    const url =
      page === 1 ? COLLECTION_BASE : `${COLLECTION_BASE}?page=${page}`;
    console.log(`Fetching collection page ${page}: ${url}`);
    const html = await fetchHtml(url);
    const urls = getProductUrlsFromHtml(html);
    if (urls.length === 0) break;
    let added = 0;
    for (const u of urls) {
      if (!seen.has(u)) {
        seen.add(u);
        all.push(u);
        added++;
      }
    }
    if (added === 0) break;
    page++;
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
  specs: string;
  coverUrl: string;
  images: string;
  availability: string;
  purchaseLink: string;
}> {
  const html = await fetchHtml(productUrl);
  const $ = cheerio.load(html);

  const title =
    $(".product__title h1").first().text().trim() ||
    $(".product__title h2.h1").first().text().trim() ||
    $('meta[property="og:title"]')
      .attr("content")
      ?.replace(/\s*–\s*GOST Books\s*$/i, "")
      .trim() ||
    $("h1").first().text().trim() ||
    "";

  const artistRaw =
    $("p.product__text.inline-richtext.h4").first().text().trim() ||
    $(".product__info-container .product__text").first().text().trim() ||
    "";
  const artist = artistRaw.replace(/^\s*by\s+/i, "").trim();

  const description =
    $(".product__description.rte").first().text().trim() ||
    $('meta[name="description"]').attr("content")?.trim() ||
    "";

  const specsEl = $("p.product__text.inline-richtext.specs").first();
  const specHtml = specsEl.html() ?? "";
  const specs =
    specHtml
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)
      .join("\n")
      .trim() || "";

  const imageUrls: string[] = [];
  $(".product__media img[src], .product-media-container img[src]").each(
    (_, el) => {
      const src = $(el).attr("src");
      if (src && !src.startsWith("data:")) imageUrls.push(normalizeUrl(src));
    },
  );
  if (imageUrls.length === 0) {
    const ogImage = $('meta[property="og:image"]').attr("content");
    if (ogImage) imageUrls.push(normalizeUrl(ogImage));
  }
  const uniqueImages = [...new Set(imageUrls)];
  const coverUrl = uniqueImages[0] ?? "";
  const maxExtra = 5;
  const images = uniqueImages.slice(1, 1 + maxExtra).join("|");

  const hasSoldOut =
    $(".price__badge-sold-out, .badge--bottom-left.color-inverse").filter(
      (_, el) => $(el).text().toLowerCase().includes("sold"),
    ).length > 0;
  const availability = hasSoldOut ? "sold out" : "available";

  const purchaseLink =
    $('link[rel="canonical"]').attr("href")?.trim() || productUrl;

  const artistExists = await artistExistsInDb(artist);

  return {
    title,
    artist,
    artistExistsInDb: artistExists,
    description,
    specs,
    coverUrl,
    images,
    availability,
    purchaseLink: purchaseLink.startsWith("http")
      ? purchaseLink
      : normalizeUrl(purchaseLink),
  };
}

async function main() {
  const outPath = process.argv[2] ?? join(process.cwd(), "output", "GOST.csv");

  console.log("Fetching product URLs from collection (all pages)...");
  const productUrls = (await getAllProductUrls()).slice(0, AMOUNT_OF_BOOKS);
  console.log(`Found ${productUrls.length} product URLs.`);

  const header: Record<string, string> = {
    title: "title",
    artist: "artist",
    artistExistsInDb: "artistExistsInDb",
    description: "description",
    specs: "specs",
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
