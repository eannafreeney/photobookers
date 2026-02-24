/**
 * Another Place Press scraper (Big Cartel)
 * Category: https://anotherplacepress.bigcartel.com/category/books
 * Product pages: /product/{permalink}
 * Title: h1 (format "Title - Artist Name"), Artist: part after " - "
 * Description: .product-description.body-text
 * Images: JSON-LD Product.image array (first = cover), else carousel + og:image
 *
 * Run: npx tsx scripts/scrapers/app.ts [output-path]
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

const BASE = "https://anotherplacepress.bigcartel.com";
const COLLECTION_URL = `${BASE}/category/books`;

function getProductUrlsFromCategory(html: string): string[] {
  const $ = cheerio.load(html);
  const urls: string[] = [];
  $('a[href*="/product/"]').each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    const path = href.split("?")[0].trim();
    if (!/\/product\/[^/]+\/?$/.test(path)) return;
    const full = normalizeUrl(path, BASE);
    if (!urls.includes(full)) urls.push(full);
  });
  return urls;
}

/**
 * Get image URLs from JSON-LD Product schema, or fallback to DOM + og:image.
 */
function getImageUrls($: cheerio.CheerioAPI, pageUrl: string): string[] {
  const imageUrls: string[] = [];

  $('script[type="application/ld+json"]').each((_, el) => {
    const text = $(el).html()?.trim();
    if (!text) return;
    try {
      const data = JSON.parse(text) as { "@type"?: string; image?: string[] };
      if (data["@type"] === "Product" && Array.isArray(data.image)) {
        for (const url of data.image) {
          if (typeof url === "string" && !url.startsWith("data:")) {
            const full = normalizeUrl(url, BASE);
            if (!imageUrls.includes(full)) imageUrls.push(full);
          }
        }
      }
    } catch {
      // ignore invalid JSON
    }
  });

  if (imageUrls.length > 0) return imageUrls;

  // Fallback: carousel gallery links (full-size) in order, then og:image
  $(
    ".product-carousel .splide__slide:not(.splide__slide--clone) a.gallery-link",
  ).each((_, el) => {
    const href = $(el).attr("href");
    if (href && !href.startsWith("data:")) {
      const full = normalizeUrl(href, BASE);
      if (!imageUrls.includes(full)) imageUrls.push(full);
    }
  });

  if (imageUrls.length > 0) return imageUrls;

  const ogImage = $('meta[property="og:image"]').attr("content");
  if (ogImage && !ogImage.startsWith("data:")) {
    imageUrls.push(normalizeUrl(ogImage, BASE));
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

  const titleRaw =
    $("h1").first().text().trim() ||
    $('meta[property="og:title"]')
      .attr("content")
      ?.replace(/\s*[-|—]\s*another place press\s*$/i, "")
      .trim() ||
    "";

  // "To Build A Home - Amanda Jackson" → title = "To Build A Home", artist = "Amanda Jackson"
  const dashIndex = titleRaw.lastIndexOf(" - ");
  const title = dashIndex > 0 ? titleRaw.slice(0, dashIndex).trim() : titleRaw;
  const artist = dashIndex > 0 ? titleRaw.slice(dashIndex + 3).trim() : "";

  const description =
    $(".product-description.body-text").first().text().trim() ||
    $('meta[name="description"]').attr("content")?.trim() ||
    "";

  const imageUrls = getImageUrls($, productUrl);
  const coverUrl = imageUrls[0] ?? "";
  const images = imageUrls.slice(1).join("|");

  const ogAvailability = $('meta[property="og:availability"]').attr("content");
  const availability = ogAvailability === "oos" ? "sold-out" : "available";

  const purchaseLink =
    $('link[rel="canonical"]').attr("href")?.trim() ||
    $('meta[property="og:url"]').attr("content")?.trim() ||
    productUrl;
  const finalPurchaseLink = purchaseLink.startsWith("http")
    ? purchaseLink
    : normalizeUrl(purchaseLink, BASE);

  const artistExists = await artistExistsInDb(artist);

  return {
    title: title || titleRaw,
    artist,
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
    process.argv[2] ??
    join(process.cwd(), "output", "anotherplacepress-books.csv");

  console.log("Fetching category page...");
  let collectionHtml = await fetchHtml(COLLECTION_URL);
  const allUrls = new Set<string>(getProductUrlsFromCategory(collectionHtml));

  // Pagination: ?page=2, ?page=3, ...
  for (let page = 2; page <= 10; page++) {
    const pageUrl = `${COLLECTION_URL}?page=${page}`;
    try {
      const pageHtml = await fetchHtml(pageUrl);
      const pageUrls = getProductUrlsFromCategory(pageHtml);
      if (pageUrls.length === 0) break;
      pageUrls.forEach((u) => allUrls.add(u));
    } catch {
      break;
    }
  }

  const urls = Array.from(allUrls);
  console.log(`Found ${urls.length} product URLs`);

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

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    console.log(`[${i + 1}/${urls.length}] ${url}`);
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
