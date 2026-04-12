/**
 * Café Royal Books scraper
 * https://www.caferoyalbooks.com/shop
 * Product title format: "Artist — Title" (em-dash separator)
 * Description: .product-description p[style*="white-space:pre-wrap"]
 * Images: product gallery thumbnails data-src
 * Availability: meta[property="product:availability"]
 *
 * Run: npx tsx scripts/scrapers/caferoyalbooks.ts [output-path]
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

const BASE = "https://www.caferoyalbooks.com";
const SHOP_URL = `${BASE}/shop`;

function getProductUrlsFromHtml(html: string): string[] {
  const $ = cheerio.load(html);
  const seen = new Set<string>();
  const urls: string[] = [];

  $("a.product-list-item-link").each((_, el) => {
    const href = $(el).attr("href") ?? "";
    if (!href) return;
    const full = normalizeUrl(href.split("?")[0], BASE);
    if (seen.has(full)) return;
    seen.add(full);
    urls.push(full);
  });

  return urls;
}

async function getAllProductUrls(): Promise<string[]> {
  const seen = new Set<string>();
  const all: string[] = [];

  let page = 1;
  for (;;) {
    const url = page === 1 ? SHOP_URL : `${SHOP_URL}?page=${page}`;
    console.log(`Fetching shop page ${page}: ${url}`);
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

  // Title is "Artist — Title" — split on first em-dash with surrounding spaces
  const rawTitle = $("h1.product-title").first().text().trim();
  const emDashIdx = rawTitle.indexOf(" \u2014 ");
  const artist =
    emDashIdx >= 0 ? rawTitle.slice(0, emDashIdx).trim() : "";
  const title =
    emDashIdx >= 0 ? rawTitle.slice(emDashIdx + 3).trim() : rawTitle;

  // Description: the first <p> inside .product-description that has white-space style
  let description = "";
  $(".product-description p").each((_, el) => {
    const style = $(el).attr("style") ?? "";
    if (!style.includes("white-space")) return;
    const inner = $(el).html() ?? "";
    const text = decodeHtmlEntities(
      inner
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<[^>]+>/g, "")
    )
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)
      .join("\n")
      .trim();
    if (text) {
      description = text;
      return false;
    }
  });

  // Images: all gallery thumbnail data-src values (deduplicated)
  const imageUrls: string[] = [];
  $("img.product-gallery-thumbnails-item-image").each((_, el) => {
    const src = $(el).attr("data-src") || $(el).attr("src") || "";
    if (!src || src.startsWith("data:")) return;
    // Strip format query string to get the base URL
    const base = src.split("?")[0];
    const full = normalizeUrl(base, BASE);
    if (!imageUrls.includes(full)) imageUrls.push(full);
  });

  // Fallback to og:image
  if (imageUrls.length === 0) {
    const og = $('meta[property="og:image"]').attr("content");
    if (og) imageUrls.push(normalizeUrl(og.split("?")[0], BASE));
  }

  const coverUrl = imageUrls[0] ?? "";
  const images = imageUrls.slice(1).join("|");

  // Availability from Squarespace meta tag
  const availMeta = $('meta[property="product:availability"]').attr("content");
  const isSoldOut =
    availMeta?.toLowerCase() === "oos" ||
    availMeta?.toLowerCase() === "out of stock" ||
    $("body").text().toLowerCase().includes("sold out");
  const availability = isSoldOut ? "sold out" : "available";

  const artistExists = await artistExistsInDb(artist);

  return {
    title,
    artist,
    artistExistsInDb: artistExists,
    description,
    coverUrl,
    images,
    availability,
    purchaseLink: productUrl,
  };
}

async function main() {
  const outPath =
    process.argv[2] ?? join(process.cwd(), "output", "caferoyalbooks.csv");

  console.log("Fetching product URLs...");
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
