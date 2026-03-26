/**
 * Charcoal Press scraper
 * Site: https://charcoalpress.com/shop
 *
 * CSV output columns (for scripts/import.ts):
 * - title
 * - artist
 * - artistExistsInDb
 * - description
 * - coverUrl
 * - images
 * - availability ("sold out" | "available")
 * - purchaseLink
 *
 * Rules requested:
 * - title = h1.product-title
 * - artist = ""
 * - description = all <p style*="white-space:pre-wrap;"> joined together
 *
 * Run:
 *   npx tsx scripts/scrapers/charcoalpress.ts output/charcoalpress.csv 20
 */
import "../env";

import * as cheerio from "cheerio";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { fetchHtml, normalizeUrl, rowToCsv } from "../scraperUtils";

const BASE = "https://charcoalpress.com";
const SHOP_URL = `${BASE}/shop`;

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

type ProductLinkMeta = {
  url: string;
  listingText: string;
};

function getProductLinksFromShop(html: string): ProductLinkMeta[] {
  const $ = cheerio.load(html);
  const raw: ProductLinkMeta[] = [];

  // product links look like /shop/<slug>
  $("a[href^='/shop/']").each((_, el) => {
    const href = ($(el).attr("href") ?? "").split("?")[0].trim();
    if (!href) return;
    if (href === "/shop" || href === "/shop/") return;

    // only one path segment after /shop/
    if (!/^\/shop\/[^/]+\/?$/.test(href)) return;

    const url = normalizeUrl(href, BASE);
    const listingText = cleanWhitespace($(el).text().toLowerCase());

    raw.push({ url, listingText });
  });

  // de-dupe by URL, keep first listing text seen
  const seen = new Set<string>();
  const out: ProductLinkMeta[] = [];
  for (const item of raw) {
    if (seen.has(item.url)) continue;
    seen.add(item.url);
    out.push(item);
  }

  return out;
}

function detectAvailability(listingText: string, pageText: string): string {
  const l = listingText.toLowerCase();
  const p = pageText.toLowerCase();

  if (
    l.includes("sold out") ||
    p.includes("sold out") ||
    p.includes("out of stock")
  ) {
    return "sold out";
  }

  return "available";
}

function getDescriptionFromRequestedSelector($: cheerio.CheerioAPI): string {
  // Exact rule requested by you
  const paragraphs = $("p[style*='white-space:pre-wrap']")
    .toArray()
    .map((el) => cleanWhitespace($(el).text()))
    .filter(Boolean);

  return paragraphs.join("\n\n").trim();
}

function getImageUrls($: cheerio.CheerioAPI): string[] {
  const urls: string[] = [];

  // Typical Squarespace product gallery/selectors
  $("img").each((_, el) => {
    const src =
      ($(el).attr("data-src") ?? "").trim() || ($(el).attr("src") ?? "").trim();

    if (!src || src.startsWith("data:")) return;
    const full = normalizeUrl(src, BASE);
    if (!/\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(full)) return;

    urls.push(full);
  });

  // fallback og:image if needed
  const og = $("meta[property='og:image']").attr("content");
  if (og) urls.push(normalizeUrl(og.trim(), BASE));

  return uniqPreserveOrder(urls);
}

async function scrapeProduct(
  productUrl: string,
  listingText: string,
): Promise<{
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

  const title = cleanWhitespace($("h1.product-title").first().text());

  // requested: artist is always empty
  const artist = "";

  // requested: description from p[style*="white-space:pre-wrap;"]
  const description = getDescriptionFromRequestedSelector($);

  const imageUrls = getImageUrls($);
  const coverUrl = imageUrls[0] ?? "";
  const images = imageUrls.slice(1).join("|");

  const bodyText = cleanWhitespace($("body").text());
  const availability = detectAvailability(listingText, bodyText);

  const purchaseLink =
    cleanWhitespace($("link[rel='canonical']").attr("href") ?? "") ||
    productUrl;

  return {
    title,
    artist,
    artistExistsInDb: false, // artist empty by design
    description,
    coverUrl,
    images,
    availability,
    purchaseLink,
  };
}

async function main() {
  const outPath =
    process.argv[2] ?? join(process.cwd(), "output", "charcoalpress.csv");
  const amount = process.argv[3] ? Math.max(0, Number(process.argv[3])) : 20;

  console.log(`Fetching shop: ${SHOP_URL}`);
  const shopHtml = await fetchHtml(SHOP_URL);
  const links = getProductLinksFromShop(shopHtml);
  const finalLinks = links.slice(0, amount);

  console.log(
    `Found ${links.length} products. Scraping ${finalLinks.length}...`,
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

  for (let i = 0; i < finalLinks.length; i++) {
    const item = finalLinks[i];
    console.log(`[${i + 1}/${finalLinks.length}] ${item.url}`);

    try {
      const row = await scrapeProduct(item.url, item.listingText);
      lines.push(rowToCsv(row));
    } catch (err) {
      console.error(`Error scraping ${item.url}:`, err);
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
