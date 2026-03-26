/**
 * APE scraper (Art Paper Editions)
 * Site: https://artpapereditions.org
 *
 * Reads product URLs from: https://artpapereditions.org/collections/all
 * Then scrapes each product page and writes CSV with:
 *   - title
 *   - artist
 *   - artistExistsInDb
 *   - description (".product__text" + ".product__more__7")
 *   - coverUrl
 *   - images (gallery URLs separated by "|", excluding coverUrl)
 *   - availability ("sold out" or "available")
 *   - purchaseLink (canonical link)
 *
 * Run:
 *   npx tsx scripts/scrapers/ape.ts output/ape.csv [amount]
 *
 * Then import:
 *   npx tsx scripts/import.ts output/ape.csv
 */
import "../env";

import * as cheerio from "cheerio";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import {
  artistExistsInDb,
  fetchHtml,
  normalizeUrl,
  rowToCsv,
} from "../scraperUtils";

const BASE = "https://artpapereditions.org";
const COLLECTION_URL = `${BASE}/collections/all`;

function cleanWhitespace(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

function uniqPreserveOrder(urls: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const u of urls) {
    if (!u) continue;
    if (seen.has(u)) continue;
    seen.add(u);
    out.push(u);
  }
  return out;
}

function getProductUrlsFromCollectionHtml(html: string): string[] {
  const $ = cheerio.load(html);
  const urls: string[] = [];
  const seen = new Set<string>();

  $('a[href*="/products/"]').each((_, el) => {
    const hrefRaw = $(el).attr("href");
    if (!hrefRaw) return;

    const withoutQuery = hrefRaw.split("?")[0].trim();
    if (!withoutQuery.startsWith("/products/")) return;

    const full = normalizeUrl(withoutQuery, BASE);

    // Ensure we only take /products/<handle> (no extra path segments)
    try {
      const pathname = new URL(full).pathname;
      if (!/^\/products\/[^/]+\/?$/.test(pathname)) return;
    } catch {
      return;
    }

    if (!seen.has(full)) {
      seen.add(full);
      urls.push(full);
    }
  });

  return urls;
}

function getImageUrlsFromProductHtml($: cheerio.CheerioAPI): string[] {
  const urls: string[] = [];

  // Slider images in the product page HTML
  $(".product__slider img").each((_, el) => {
    const $img = $(el);

    const src =
      $img.attr("data-src") ||
      $img.attr("src") ||
      $img.attr("data-zoom") ||
      $img.attr("data-srcset") ||
      "";

    const candidate = String(src).trim();
    if (!candidate || candidate.startsWith("data:")) return;

    const normalized = normalizeUrl(candidate, BASE);

    // Filter out arrow icons etc.
    const lower = normalized.toLowerCase();
    if (lower.includes(".svg")) return;

    // Prefer typical image formats
    if (!/\.(jpe?g|png|webp|gif)(\?|#|$)/i.test(normalized)) {
      // Some Shopify assets might still have no extension; keep only if in shop files
      if (!normalized.includes("/cdn/shop/")) return;
    }

    urls.push(normalized);
  });

  const unique = uniqPreserveOrder(urls);
  if (unique.length > 0) return unique;

  // Fallback: og:image
  const ogImage = $('meta[property="og:image"]').attr("content");
  if (ogImage) return [normalizeUrl(String(ogImage), BASE)];

  return [];
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

  // APE product example:
  // - h1: artist ("Pippa Garner")
  // - h2: title ("Personal Ads")
  //
  // NOTE: you wrote "h1=artist h2=artist", but for the CSV we still need a separate `title`.
  // This assumes the normal interpretation: artist=h1, title=h2.
  const titleFromH2 = cleanWhitespace($(".product__title h2").first().text());
  const artistFromH1 = cleanWhitespace($(".product__title h1").first().text());

  // Fallback parsing from og:title like "Pippa Garner / Personal Ads"
  const ogTitle = cleanWhitespace(
    $('meta[property="og:title"]').attr("content") ?? "",
  );
  let artist = artistFromH1;
  let title = titleFromH2;

  if ((!artist || !title) && ogTitle.includes("/")) {
    const parts = ogTitle.split("/").map((p) => cleanWhitespace(p));
    if (!artist && parts[0]) artist = parts[0];
    if (!title && parts.slice(1).join(" / "))
      title = parts.slice(1).join(" / ");
  }

  if (!artist) artist = "";
  if (!title) title = ogTitle || "";

  // Description: ".product__text" + ".product__more__7"
  const descriptionParts: string[] = [];

  const $productText = $(".product__text").first();
  if ($productText.length) {
    const paragraphs = $productText.find("p").toArray();
    if (paragraphs.length > 0) {
      for (const p of paragraphs) {
        const cleaned = $(p)
          .clone()
          .find("meta, script, style")
          .remove()
          .end()
          .text();
        const text = cleanWhitespace(cleaned);
        if (text) descriptionParts.push(text);
      }
    } else {
      const cleaned = $productText
        .clone()
        .find("meta, script, style")
        .remove()
        .end()
        .text();
      const text = cleanWhitespace(cleaned);
      if (text) descriptionParts.push(text);
    }
  }

  const moreBlocks = $(".product__more__7").toArray();
  for (const el of moreBlocks) {
    const cleaned = $(el)
      .clone()
      .find("meta, script, style")
      .remove()
      .end()
      .text();
    const text = cleanWhitespace(cleaned);
    if (text) descriptionParts.push(text);
  }

  const description = descriptionParts.join("\n\n").trim();

  // Images
  const imageUrls = getImageUrlsFromProductHtml($);
  const coverUrl = imageUrls[0] ?? "";
  const images = imageUrls.slice(1).join("|");

  // Availability: detect "sold out" in page text and/or disabled button
  const bodyLower = $("body").text().toLowerCase();
  const addButtonTextLower = $(".add-to-cart-btn").first().text().toLowerCase();

  const soldOut =
    bodyLower.includes("sold out") ||
    bodyLower.includes("out of stock") ||
    addButtonTextLower.includes("sold out") ||
    $(".add-to-cart-btn[disabled]").length > 0 ||
    $(".add-to-cart-btn.disabled").length > 0;

  const availability = soldOut ? "sold out" : "available";

  const purchaseLinkRaw =
    $('link[rel="canonical"]').attr("href")?.trim() ?? productUrl;

  const purchaseLink = purchaseLinkRaw.startsWith("http")
    ? purchaseLinkRaw
    : normalizeUrl(purchaseLinkRaw, BASE);

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
  const outPath = process.argv[2] ?? join(process.cwd(), "output", "ape.csv");
  const amountArg = process.argv[3];
  const amount = amountArg ? Math.max(0, Number(amountArg)) : 15;

  console.log(`Fetching collection: ${COLLECTION_URL}`);
  const collectionHtml = await fetchHtml(COLLECTION_URL);
  const productUrls = getProductUrlsFromCollectionHtml(collectionHtml);

  const finalUrls = productUrls.slice(0, amount);
  console.log(
    `Found ${productUrls.length} products. Scraping ${finalUrls.length}...`,
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
