/**
 * Four Eyes éditions scraper (Shopify)
 *
 * Site:
 * - https://foureyeseditions.shop/en/collections/toutes-nos-creations
 *
 * Field mapping:
 * - title: h1.product-title-block (fallback: og:title)
 * - artist: first <strong> text inside div[x-data="RTE"]
 * - description: text content of div[x-data="RTE"]
 *
 * Run:
 *   npx tsx scripts/scrapers/four-eyes-editions.ts [output-path] [amount] [maxPages]
 *
 * Example:
 *   npx tsx scripts/scrapers/four-eyes-editions.ts output/four-eyes-editions.csv 50 10
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
import { client } from "../../src/db/client";

const BASE = "https://foureyeseditions.shop";
const COLLECTION_URL = `${BASE}/en/collections/toutes-nos-creations`;

function cleanWhitespace(s: string): string {
  return (s ?? "").replace(/\s+/g, " ").trim();
}

function uniqPreserveOrder(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    if (!value) continue;
    if (seen.has(value)) continue;
    seen.add(value);
    out.push(value);
  }
  return out;
}

function htmlToParagraphText(html: string): string {
  const $d = cheerio.load(html);
  $d("meta, script, style").remove();

  const paragraphs = $d("p")
    .toArray()
    .map((p) => cleanWhitespace($d(p).text()))
    .filter(Boolean);

  if (paragraphs.length > 0) return paragraphs.join("\n\n");

  return cleanWhitespace($d.root().text());
}

function getProductUrlsFromCollectionHtml(html: string): string[] {
  const $ = cheerio.load(html);
  const urls: string[] = [];
  const seen = new Set<string>();

  $('a[href*="/en/products/"]').each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;

    const withoutQuery = href.split("?")[0].trim();
    if (!withoutQuery.startsWith("/en/products/")) return;

    const full = normalizeUrl(withoutQuery, BASE);
    try {
      const pathname = new URL(full).pathname;
      if (!/^\/en\/products\/[^/]+\/?$/.test(pathname)) return;
    } catch {
      return;
    }

    if (seen.has(full)) return;
    seen.add(full);
    urls.push(full);
  });

  return uniqPreserveOrder(urls);
}

function extractArtistFromRte($: cheerio.CheerioAPI): string {
  const strongText = $('div[x-data="RTE"] strong').first().text();
  return cleanWhitespace(strongText);
}

function extractImageUrls($: cheerio.CheerioAPI): string[] {
  const imageUrls: string[] = [];

  $('[data-product-media-container] img, [data-product-single-media-wrapper] img')
    .each((_, el) => {
      const src =
        $(el).attr("src") ??
        $(el).attr("data-src") ??
        $(el).attr("data-lazy-src") ??
        "";
      if (!src || src.startsWith("data:")) return;
      const normalized = normalizeUrl(src.split("?")[0], BASE);
      imageUrls.push(normalized);
    });

  if (imageUrls.length === 0) {
    const ogImage = $('meta[property="og:image"]').attr("content") ?? "";
    if (ogImage) imageUrls.push(normalizeUrl(ogImage, BASE));
  }

  return uniqPreserveOrder(imageUrls);
}

async function scrapeProduct(productUrl: string): Promise<{
  title: string;
  artist: string;
  artistExistsInDb: boolean;
  description: string;
  coverUrl: string;
  images: string;
  availability: "available" | "sold out";
  purchaseLink: string;
}> {
  const html = await fetchHtml(productUrl);
  const $ = cheerio.load(html);

  const title =
    cleanWhitespace($("h1.product-title-block").first().text()) ||
    cleanWhitespace($("h1").first().text()) ||
    cleanWhitespace($('meta[property="og:title"]').attr("content") ?? "");

  const artist = extractArtistFromRte($);

  const descriptionHtml = $('div[x-data="RTE"]').first().html() ?? "";
  const description = descriptionHtml ? htmlToParagraphText(descriptionHtml) : "";

  const imageUrls = extractImageUrls($);
  const coverUrl = imageUrls[0] ?? "";
  const images = imageUrls.slice(1).join("|");

  const bodyText = $("body").text().toLowerCase();
  const soldOut =
    bodyText.includes("sold out") ||
    bodyText.includes("out of stock") ||
    bodyText.includes("unavailable");
  const availability: "available" | "sold out" = soldOut
    ? "sold out"
    : "available";

  const canonical = cleanWhitespace($('link[rel="canonical"]').attr("href") ?? "");
  const purchaseLink = canonical ? canonical : productUrl;

  const artistInDb = artist ? await artistExistsInDb(artist) : false;

  return {
    title,
    artist,
    artistExistsInDb: artistInDb,
    description,
    coverUrl,
    images,
    availability,
    purchaseLink: purchaseLink.startsWith("http")
      ? purchaseLink
      : normalizeUrl(purchaseLink, BASE),
  };
}

async function main() {
  const outPath =
    process.argv[2] ?? join(process.cwd(), "output", "four-eyes-editions.csv");
  const amountArg = process.argv[3];
  const maxPagesArg = process.argv[4];

  const amount = amountArg ? Math.max(0, Number(amountArg)) : 50;
  const maxPages = maxPagesArg ? Math.max(1, Number(maxPagesArg)) : 10;

  console.log(`Fetching collection: ${COLLECTION_URL}`);

  const allProductUrls: string[] = [];

  for (let page = 1; page <= maxPages; page++) {
    if (allProductUrls.length >= amount) break;

    const pageUrl = page === 1 ? COLLECTION_URL : `${COLLECTION_URL}?page=${page}`;
    const collectionHtml = await fetchHtml(pageUrl);
    const pageUrls = getProductUrlsFromCollectionHtml(collectionHtml);

    if (pageUrls.length === 0) break;

    for (const url of pageUrls) {
      if (!allProductUrls.includes(url)) allProductUrls.push(url);
      if (allProductUrls.length >= amount) break;
    }
  }

  const finalUrls = allProductUrls.slice(0, amount);
  console.log(
    `Found ${allProductUrls.length} product URLs. Scraping ${finalUrls.length}...`,
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

main()
  .then(async () => {
    await client.end({ timeout: 5 });
  })
  .catch(async (err) => {
    console.error(err);
    await client.end({ timeout: 5 });
    process.exit(1);
  });

