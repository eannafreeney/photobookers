/**
 * Jungle Books scraper (Shopify)
 * Base: https://www.jungle-books.com/
 * Product pages: /products/{slug}
 *
 * Rules:
 * - artist = <h1> part before first ":"
 * - title = <h1> part after first ":"
 * - description = .product__description
 *
 * Run:
 *   npx tsx scripts/scrapers/jungle.ts [output-path]
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

const BASE = "https://www.jungle-books.com";
const SITEMAP_INDEX = `${BASE}/sitemap.xml`;
const PRODUCT_PATH_RE = /^\/products\/[^/]+$/;

function cleanText(s: string): string {
  return s
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

function splitArtistAndTitleFromH1(h1: string): {
  artist: string;
  title: string;
} {
  const raw = decodeHtmlEntities(h1).trim();
  const idx = raw.indexOf(":");
  if (idx === -1) {
    return { artist: "", title: raw };
  }
  const artist = raw.slice(0, idx).trim();
  const title = raw.slice(idx + 1).trim();
  return { artist, title };
}

function extractProductUrlsFromXml(xml: string): string[] {
  const $ = cheerio.load(xml, { xmlMode: true });
  const urls: string[] = [];
  $("url > loc").each((_, el) => {
    const loc = $(el).text().trim();
    if (!loc) return;
    try {
      const path = new URL(loc).pathname.replace(/\/$/, "");
      if (PRODUCT_PATH_RE.test(path) && !urls.includes(loc)) {
        urls.push(loc);
      }
    } catch {
      // ignore malformed URLs
    }
  });
  return urls;
}

async function getAllProductUrls(): Promise<string[]> {
  const indexXml = await fetchHtml(SITEMAP_INDEX);
  const $ = cheerio.load(indexXml, { xmlMode: true });

  const productSitemaps: string[] = [];
  $("sitemap > loc").each((_, el) => {
    const loc = $(el).text().trim();
    if (!loc) return;
    if (/sitemap_products_\d+\.xml/i.test(loc)) {
      productSitemaps.push(loc);
    }
  });

  // Fallback in case sitemap index parsing fails for any reason.
  if (productSitemaps.length === 0) {
    productSitemaps.push(`${BASE}/sitemap_products_1.xml`);
  }

  const seen = new Set<string>();
  const all: string[] = [];

  for (const smUrl of productSitemaps) {
    try {
      console.log("Fetching product sitemap:", smUrl);
      const xml = await fetchHtml(smUrl);
      const urls = extractProductUrlsFromXml(xml);
      for (const u of urls) {
        if (!seen.has(u)) {
          seen.add(u);
          all.push(u);
        }
      }
    } catch (err) {
      console.warn("Failed sitemap:", smUrl, err);
    }
  }

  return all;
}

function getDescription($: cheerio.CheerioAPI): string {
  const descNode = $(".product__description").first();
  if (!descNode.length) return "";

  const html = descNode.html() ?? "";
  const text = decodeHtmlEntities(html)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*/gi, "\n\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n");

  return cleanText(text);
}

function getImageUrls($: cheerio.CheerioAPI): string[] {
  const imageUrls: string[] = [];

  // Main product media gallery
  $(
    ".product__media-list img[src], .product__media-list img[srcset], .product__media-wrapper img[src], .product__media-wrapper img[srcset]",
  ).each((_, el) => {
    const src =
      $(el).attr("src") ||
      $(el).attr("srcset")?.split(",")[0]?.trim()?.split(/\s+/)[0];
    if (!src || src.startsWith("data:")) return;
    const full = normalizeUrl(src, BASE);
    if (!imageUrls.includes(full)) imageUrls.push(full);
  });

  // Modal images fallback
  if (imageUrls.length === 0) {
    $("product-modal img[src], product-modal img[srcset]").each((_, el) => {
      const src =
        $(el).attr("src") ||
        $(el).attr("srcset")?.split(",")[0]?.trim()?.split(/\s+/)[0];
      if (!src || src.startsWith("data:")) return;
      const full = normalizeUrl(src, BASE);
      if (!imageUrls.includes(full)) imageUrls.push(full);
    });
  }

  // OG image fallback
  if (imageUrls.length === 0) {
    const og = $('meta[property="og:image"]').attr("content")?.trim();
    if (og) imageUrls.push(normalizeUrl(og, BASE));
  }

  return imageUrls;
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

  const h1 = $("h1").first().text().trim();
  const parsed = splitArtistAndTitleFromH1(h1);

  const description = getDescription($);

  const imageUrls = getImageUrls($);
  const coverUrl = imageUrls[0] ?? "";
  const images = imageUrls.slice(1).join("|");

  const soldOut =
    $(".price__badge-sold-out:contains('Sold out')").length > 0 ||
    $("body").text().toLowerCase().includes("sold out");
  const availability = soldOut ? "sold-out" : "available";

  const purchaseLink =
    $('link[rel="canonical"]').attr("href")?.trim() ||
    $('meta[property="og:url"]').attr("content")?.trim() ||
    productUrl;
  const finalPurchaseLink = purchaseLink.startsWith("http")
    ? purchaseLink
    : normalizeUrl(purchaseLink, BASE);

  const artistExists = await artistExistsInDb(parsed.artist);

  return {
    title: parsed.title,
    artist: parsed.artist,
    artistExistsInDb: artistExists,
    description,
    coverUrl,
    images,
    availability,
    purchaseLink: finalPurchaseLink,
  };
}

async function main() {
  const outPath =
    process.argv[2] ?? join(process.cwd(), "output", "jungle-books.csv");

  console.log("Fetching product URLs from sitemap...");
  const productUrls = await getAllProductUrls();
  console.log(`Found ${productUrls.length} product URLs`);

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
