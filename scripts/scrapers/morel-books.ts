/**
 * Morel Books scraper
 * Site: https://morelbooks.com/collections/all-books
 *
 * Notes:
 * - Uses Shopify's embedded `script` with id starting `ProductJson-...` to extract
 *   structured product data (images, availability, description HTML).
 * - The CSV schema matches what `scripts/import.ts` expects.
 *
 * CSV output columns:
 *   - title
 *   - artist
 *   - artistExistsInDb
 *   - description
 *   - coverUrl
 *   - images (gallery URLs separated by "|", excluding coverUrl)
 *   - availability ("sold out" | "available")
 *   - purchaseLink
 *
 * Run:
 *   npx tsx scripts/scrapers/morel-books.ts output/morel-books.csv [amount] [maxPages]
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

const BASE = "https://morelbooks.com";
const COLLECTION_URL = `${BASE}/collections/all-books`;

function cleanWhitespace(s: string): string {
  return (s ?? "").replace(/\s+/g, " ").trim();
}

function uniqPreserveOrder(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of values) {
    if (!v) continue;
    if (seen.has(v)) continue;
    seen.add(v);
    out.push(v);
  }
  return out;
}

function getProductUrlsFromCollectionHtml(html: string): string[] {
  const $ = cheerio.load(html);
  const urls: string[] = [];
  const seen = new Set<string>();

  $('a[href*="/products/"]').each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;

    const withoutQuery = href.split("?")[0].trim();
    if (!withoutQuery.startsWith("/products/")) return;

    const full = normalizeUrl(withoutQuery, BASE);
    try {
      const pathname = new URL(full).pathname;
      if (!/^\/products\/[^/]+\/?$/.test(pathname)) return;
    } catch {
      return;
    }

    if (seen.has(full)) return;
    seen.add(full);
    urls.push(full);
  });

  return uniqPreserveOrder(urls);
}

type ProductJson = {
  title?: string;
  description?: string;
  vendor?: string;
  images?: string[];
  available?: boolean;
  url?: string;
  handle?: string;
};

function extractProductJson(
  html: string,
): { productJson: ProductJson; $: cheerio.CheerioAPI } | null {
  const $ = cheerio.load(html);
  const script = $(
    'script[type="application/json"][id^="ProductJson-"]',
  ).first();
  const raw = script.text();
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as ProductJson;
    return { productJson: parsed, $ };
  } catch {
    return null;
  }
}


function extractDescriptionText(descriptionHtml: string): string {
  const $d = cheerio.load(descriptionHtml);
  $d("meta, script, style").remove();

  const paragraphTexts = $d("p")
    .toArray()
    .map((p) => cleanWhitespace($d(p).text()))
    .filter(Boolean);

  if (paragraphTexts.length > 0) {
    return paragraphTexts.join("\n\n").trim();
  }

  const fallback = cleanWhitespace($d.root().text());
  return fallback ? fallback : "";
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
  const extracted = extractProductJson(html);
  const $ = extracted?.$ ?? cheerio.load(html);
  const productJson: ProductJson | undefined = extracted?.productJson;

  const title =
    cleanWhitespace(productJson?.title ?? "") ||
    cleanWhitespace($("h1.product-title").first().text()) ||
    cleanWhitespace($("meta[property='og:title']").attr("content") ?? "");

  // Description: prefer the structured JSON field; fall back to the DOM .rte block.
  const descriptionHtml =
    productJson?.description ||
    $(".product-detail__detail .rte").html() ||
    "";
  const description = descriptionHtml
    ? extractDescriptionText(descriptionHtml)
    : "";

  // Mörel uses the product title as the artist/photographer name with no
  // separate artist field on the page, so leave this empty and let the
  // import process match against existing creators.
  const artist = "";

  const imageUrlsRaw = (productJson?.images ?? []).map((u) => String(u));
  const imageUrls = uniqPreserveOrder(
    imageUrlsRaw.map((u) => normalizeUrl(u, BASE)).filter(Boolean),
  );

  const coverUrl = imageUrls[0] ?? "";
  const images = imageUrls.slice(1).join("|");

  // Trust the JSON `available` flag first — it's authoritative and avoids
  // false positives from "Sold out" labels in the recommendations section.
  // Only fall back to text scanning if the JSON field is absent, and scope
  // that scan to the product form area rather than the whole body.
  const availableFromJson =
    typeof productJson?.available === "boolean" ? productJson.available : null;

  let soldOut: boolean;
  if (availableFromJson !== null) {
    soldOut = !availableFromJson;
  } else {
    const formText = $(".product-detail__form, form#product_form_")
      .first()
      .text()
      .toLowerCase();
    soldOut =
      formText.includes("sold out") ||
      formText.includes("out of stock") ||
      formText.includes("unavailable");
  }

  const availability = soldOut ? "sold out" : "available";

  const canonical = cleanWhitespace(
    $("link[rel='canonical']").attr("href") ?? "",
  );
  const purchaseLink = canonical ? canonical : productUrl;

  const artistExists = artist ? await artistExistsInDb(artist) : false;

  return {
    title,
    artist,
    artistExistsInDb: artistExists,
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
  const outPath = process.argv[2] ?? join(process.cwd(), "output", "morel.csv");
  const amountArg = process.argv[3];
  const maxPagesArg = process.argv[4];

  const amount = amountArg ? Math.max(0, Number(amountArg)) : 50;
  const maxPages = maxPagesArg ? Math.max(1, Number(maxPagesArg)) : 10;

  console.log(`Fetching collection: ${COLLECTION_URL}`);

  const allProductUrls: string[] = [];

  for (let page = 1; page <= maxPages; page++) {
    if (allProductUrls.length >= amount) break;

    const pageUrl =
      page === 1 ? COLLECTION_URL : `${COLLECTION_URL}?page=${page}`;
    const collectionHtml = await fetchHtml(pageUrl);
    const pageUrls = getProductUrlsFromCollectionHtml(collectionHtml);

    if (pageUrls.length === 0) break;

    for (const u of pageUrls) {
      if (!allProductUrls.includes(u)) allProductUrls.push(u);
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

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
