/**
 * Radius Books scraper (Squarespace commerce)
 * https://www.radiusbooks.org/all-books
 * Product pages: /all-books/p/<slug>
 *
 * Field mapping:
 * - title: h1.product-title (split on ": " for artist when present)
 * - artist: portion before first ": " in product title
 * - description: .product-description p tags
 * - images: .product-gallery img (Squarespace CDN content images)
 * - availability: meta[property="product:availability"]
 *
 * Run:
 *   npx tsx scripts/scrapers/radiusbooks.ts [output-path] [maxProducts]
 *
 * Example:
 *   npx tsx scripts/scrapers/radiusbooks.ts output/radiusbooks.csv 15
 *   npx tsx scripts/scrapers/radiusbooks.ts output/radiusbooks.csv 0   # all books
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

const BASE = "https://www.radiusbooks.org";
const LISTING_URL = `${BASE}/all-books`;

/** Non-book product slugs to skip */
const EXCLUDED_SLUGS = new Set([
  "subscription",
  "catalog-2025",
  "gift-certificates",
  "radius-books-gift-card-2023",
]);

function cleanText(s: string): string {
  return decodeHtmlEntities((s ?? "").replace(/\s+/g, " ").trim());
}

function parseTitleArtist(rawTitle: string): { title: string; artist: string } {
  const cleaned = cleanText(rawTitle);
  if (!cleaned) return { title: "", artist: "" };

  const colonIdx = cleaned.indexOf(": ");
  if (colonIdx > 0) {
    return {
      artist: cleaned.slice(0, colonIdx).trim(),
      title: cleaned.slice(colonIdx + 2).trim(),
    };
  }

  return { title: cleaned, artist: "" };
}

function getProductUrlsFromHtml(html: string): string[] {
  const $ = cheerio.load(html);
  const urls: string[] = [];
  const seen = new Set<string>();

  $("a.product-list-item-link[href]").each((_, el) => {
    const href = cleanText($(el).attr("href") ?? "");
    if (!href.includes("/all-books/p/")) return;

    const url = normalizeUrl(href.split("?")[0], BASE);
    const slug = url.split("/").pop() ?? "";
    if (EXCLUDED_SLUGS.has(slug)) return;

    if (!seen.has(url)) {
      seen.add(url);
      urls.push(url);
    }
  });

  return urls;
}

async function collectProductUrls(maxProducts: number): Promise<string[]> {
  const urls: string[] = [];
  const seenProducts = new Set<string>();
  const seenListings = new Set<string>();
  let nextUrl: string | null = LISTING_URL;

  while (nextUrl) {
    if (seenListings.has(nextUrl)) break;
    seenListings.add(nextUrl);

    console.log(`Fetching listing: ${nextUrl}`);
    const html = await fetchHtml(nextUrl);
    for (const url of getProductUrlsFromHtml(html)) {
      if (seenProducts.has(url)) continue;
      seenProducts.add(url);
      urls.push(url);
      if (maxProducts > 0 && urls.length >= maxProducts) return urls;
    }

    const $ = cheerio.load(html);
    const nextHref = cleanText($("a.list-pagination-next").attr("href") ?? "");
    nextUrl = nextHref ? normalizeUrl(nextHref, BASE) : null;
    if (nextUrl && seenListings.has(nextUrl)) nextUrl = null;
  }

  return maxProducts > 0 ? urls.slice(0, maxProducts) : urls;
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
    cleanText($("h1.product-title").first().text()) ||
    cleanText($('meta[property="og:title"]').attr("content") ?? "").replace(
      /\s+[—-]\s+Radius Books$/i,
      "",
    );
  const { title, artist } = parseTitleArtist(rawTitle);

  const descParts: string[] = [];
  $(".product-description")
    .first()
    .find("p")
    .each((_, el) => {
      const text = cleanText($(el).text());
      if (text) descParts.push(text);
    });
  const description = descParts.join("\n\n");

  const imageUrls: string[] = [];
  $(".product-gallery img").each((_, el) => {
    const src =
      $(el).attr("data-src") ?? $(el).attr("data-image") ?? $(el).attr("src") ?? "";
    if (!src || src.startsWith("data:")) return;
    if (!src.includes("images.squarespace-cdn.com/content/")) return;
    if (src.includes("Radius+Books+Red")) return;

    const normalized = normalizeUrl(src.split("?")[0], BASE);
    if (!imageUrls.includes(normalized)) imageUrls.push(normalized);
  });

  if (imageUrls.length === 0) {
    const ogImage = cleanText($('meta[property="og:image"]').attr("content") ?? "");
    if (ogImage) imageUrls.push(normalizeUrl(ogImage.split("?")[0], BASE));
  }

  const availabilityMeta = cleanText(
    $('meta[property="product:availability"]').attr("content") ?? "",
  ).toLowerCase();
  const availability =
    availabilityMeta.includes("instock") || availabilityMeta.includes("in stock")
      ? "available"
      : availabilityMeta
        ? "sold out"
        : $("body").text().toLowerCase().includes("sold out")
          ? "sold out"
          : "available";

  const coverUrl = imageUrls[0] ?? "";
  const images = imageUrls.slice(1).join("|");
  const canonical = cleanText($('link[rel="canonical"]').attr("href") ?? "");
  const purchaseLink = canonical || productUrl;
  const artistInDb = artist ? await artistExistsInDb(artist) : false;

  return {
    title,
    artist,
    artistExistsInDb: artistInDb,
    description,
    coverUrl,
    images,
    availability,
    purchaseLink,
  };
}

async function main() {
  const outPath =
    process.argv[2] ?? join(process.cwd(), "output", "radiusbooks.csv");
  const maxProducts = Number(process.argv[3] ?? 15);
  const skipDbCheck = process.argv.includes("--skip-db-check");

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

  const productUrls = await collectProductUrls(maxProducts);
  console.log(`Found ${productUrls.length} product URLs.`);

  const lines: string[] = [rowToCsv(header)];
  for (let i = 0; i < productUrls.length; i++) {
    const url = productUrls[i];
    console.log(`[${i + 1}/${productUrls.length}] ${url}`);
    try {
      const row = await scrapeProduct(url);
      lines.push(
        rowToCsv({
          ...row,
          artistExistsInDb: skipDbCheck ? false : row.artistExistsInDb,
        }),
      );
      await new Promise((r) => setTimeout(r, 150));
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
