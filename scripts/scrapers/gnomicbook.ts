/**
 * Gnomic Book books scraper
 * Site: https://gnomicbook.com/collections/books
 *
 * Field mapping:
 * - title: h1.product__title
 * - artist: p.product__vendor (strip leading "by")
 * - description: p.MsoNormal
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
 *   npx tsx scripts/scrapers/gnomicbook.ts output/gnomicbook.csv [amount] [maxPages]
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

const BASE = "https://gnomicbook.com";
const COLLECTION_URL = `${BASE}/collections/books`;

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
    const full = normalizeUrl(withoutQuery, BASE);

    try {
      const pathname = new URL(full).pathname;
      // Keep "books collection product" links only.
      if (!/^\/collections\/books\/products\/[^/]+\/?$/i.test(pathname)) return;
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
  images?: string[];
  available?: boolean;
};

function extractProductJson(html: string): ProductJson | null {
  const $ = cheerio.load(html);
  const raw = $('script[type="application/json"][id^="ProductJson-"]')
    .first()
    .text();
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ProductJson;
  } catch {
    return null;
  }
}

function extractDescription($: cheerio.CheerioAPI): string {
  const paragraphs = $("p.MsoNormal")
    .toArray()
    .map((p) => cleanWhitespace(decodeHtmlEntities($(p).text())))
    .filter(Boolean);

  return paragraphs.join("\n\n");
}

function extractImageUrls(
  $: cheerio.CheerioAPI,
  productJson: ProductJson | null,
): string[] {
  const urls: string[] = [];

  const push = (value: string | undefined | null) => {
    if (!value) return;
    const normalized = normalizeUrl(String(value).trim(), BASE).replace(
      /&amp;/g,
      "&",
    );
    if (!normalized || normalized.startsWith("data:")) return;
    urls.push(normalized);
  };

  // 1) Prefer Shopify product JSON images.
  for (const u of productJson?.images ?? []) push(u);

  // 2) Product gallery DOM fallback.
  $(".product-gallery__item img").each((_, el) => {
    push($(el).attr("src"));
  });

  // 3) OG image fallback.
  push($('meta[property="og:image"]').attr("content"));

  return uniqPreserveOrder(urls);
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
  const productJson = extractProductJson(html);

  const title = cleanWhitespace($("h1.product__title").first().text());
  const artistRaw = cleanWhitespace($("p.product__vendor").first().text());
  const artist = artistRaw.replace(/^by\s+/i, "").trim();

  const description = extractDescription($);

  const imageUrls = extractImageUrls($, productJson);
  const coverUrl = imageUrls[0] ?? "";
  const images = imageUrls.slice(1).join("|");

  const bodyLower = $("body").text().toLowerCase();
  const soldOutByText =
    bodyLower.includes("sold out") || bodyLower.includes("out of stock");
  const soldOutByJson = productJson?.available === false;
  const availability = soldOutByText || soldOutByJson ? "sold out" : "available";

  const canonical = cleanWhitespace($('link[rel="canonical"]').attr("href") ?? "");
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
  const outPath = process.argv[2] ?? join(process.cwd(), "output", "gnomicbook.csv");
  const amountArg = process.argv[3];
  const maxPagesArg = process.argv[4];

  const amount = amountArg ? Math.max(0, Number(amountArg)) : 40;
  const maxPages = maxPagesArg ? Math.max(1, Number(maxPagesArg)) : 10;

  console.log(`Fetching collection: ${COLLECTION_URL}`);

  const allProductUrls: string[] = [];
  for (let page = 1; page <= maxPages; page++) {
    if (allProductUrls.length >= amount) break;

    const pageUrl = page === 1 ? COLLECTION_URL : `${COLLECTION_URL}?page=${page}`;
    const html = await fetchHtml(pageUrl);
    const pageUrls = getProductUrlsFromCollectionHtml(html);
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
