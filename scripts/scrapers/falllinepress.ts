/**
 * Fall Line Press scraper
 * Fetches book data from https://falllinepress.com/collections/current-titles
 * and writes CSV with: title, artist, artistExistsInDb, description, coverUrl, images, availability, tags, purchaseLink
 *
 * Run: npx tsx scripts/scrapers/scrape-falllinepress.ts [output-path]
 */

import * as cheerio from "cheerio";
import { ilike } from "drizzle-orm";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { db } from "../../src/db/client";
import { creators } from "../../src/db/schema";

const BASE = "https://falllinepress.com";
const COLLECTION_URL = `${BASE}/collections/current-titles`;

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

async function getProductUrls(collectionHtml: string): Promise<string[]> {
  const $ = cheerio.load(collectionHtml);
  const urls: string[] = [];
  $('a[href*="/products/"]').each((_, el) => {
    const href = $(el).attr("href");
    if (href) {
      const full = normalizeUrl(href);
      if (!urls.includes(full)) urls.push(full);
    }
  });
  return urls;
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

  const rawTitle =
    $("h1").first().text().trim() ||
    $('meta[property="og:title"]').attr("content")?.trim() ||
    "";
  const byIndex = rawTitle.lastIndexOf(" by ");
  const title = byIndex >= 0 ? rawTitle.slice(0, byIndex).trim() : rawTitle;
  const artist = byIndex >= 0 ? rawTitle.slice(byIndex + 4).trim() : "";

  let description = "";
  if ($(".product__description.rte").length) {
    description = $(".product__description.rte").text().trim();
  }
  if (!description) {
    description =
      $('meta[name="description"]').attr("content")?.trim() ||
      $(".product__description.rte p").first().text().trim() ||
      "";
  }

  const imageUrls: string[] = [];
  $(".product__media-list .product__media img[src]").each((_, el) => {
    const src = $(el).attr("src");
    if (src) imageUrls.push(normalizeUrl(src));
  });
  if (imageUrls.length === 0) {
    $('img[src*="cdn/shop/files"]').each((_, el) => {
      const src = $(el).attr("src");
      if (src) imageUrls.push(normalizeUrl(src));
    });
  }
  const uniqueImages = [...new Set(imageUrls)];
  const coverUrl = uniqueImages[0] ?? "";
  const images = uniqueImages.slice(1).join("|");

  const artistExists = await artistExistsInDb(artist);

  return {
    title,
    artist,
    artistExistsInDb: artistExists,
    description,
    coverUrl,
    images,
    availability: "available",
    purchaseLink: productUrl,
  };
}

async function main() {
  const outPath =
    process.argv[2] ?? join(process.cwd(), "output", "fallline.csv");

  console.log("Fetching collection page...");
  const collectionHtml = await fetchHtml(COLLECTION_URL);
  const productUrls = await getProductUrls(collectionHtml);
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
      lines.push(
        rowToCsv({
          ...row,
          artistExistsInDb: row.artistExistsInDb,
        }),
      );
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
