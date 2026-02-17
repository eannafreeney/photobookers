/**
 * GOST Books scraper
 * Fetches product URLs from the paginated collection:
 *   https://gostbooks.com/collections/current-books
 *   https://gostbooks.com/collections/current-books?page=2
 * Then scrapes each product page and writes CSV: title, artist, artistExistsInDb,
 * description, coverUrl, images, availability, purchaseLink
 *
 * Run: npx tsx scripts/scrapers/gostbooks.ts [output-path]
 */

import * as cheerio from "cheerio";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import {
  artistExistsInDb,
  fetchHtml,
  normalizeUrl,
  rowToCsv,
} from "../scraperUtils";

const BASE = "https://gostbooks.com";
const COLLECTION_BASE = `${BASE}/collections/current-books`;
const AMOUNT_OF_BOOKS = 10;

/** Collect product URLs from one collection page HTML */
function getProductUrlsFromHtml(html: string): string[] {
  const $ = cheerio.load(html);
  const urls: string[] = [];
  $('a[href*="/products/"]').each((_, el) => {
    const href = $(el).attr("href");
    if (href) {
      const full = normalizeUrl(href.split("?")[0], BASE);
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

  const descFromRte =
    $(".product__description.rte").first().text().trim() ||
    $('meta[name="description"]').attr("content")?.trim() ||
    "";
  const specsEl = $("p.product__text.inline-richtext.specs").first();
  const specHtml = specsEl.html() ?? "";
  const specsText =
    specHtml
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)
      .join("\n")
      .trim() || "";
  const description = [descFromRte, specsText].filter(Boolean).join("\n\n");

  const imageUrls: string[] = [];
  $(".product__media img[src], .product-media-container img[src]").each(
    (_, el) => {
      const src = $(el).attr("src");
      if (src && !src.startsWith("data:"))
        imageUrls.push(normalizeUrl(src, BASE));
    },
  );
  if (imageUrls.length === 0) {
    const ogImage = $('meta[property="og:image"]').attr("content");
    if (ogImage) imageUrls.push(normalizeUrl(ogImage, BASE));
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
      : normalizeUrl(purchaseLink, BASE),
  };
}

async function main() {
  const outPath = process.argv[2] ?? join(process.cwd(), "output", "gost.csv");

  console.log("Fetching product URLs from collection (all pages)...");
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
