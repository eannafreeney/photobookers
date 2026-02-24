/**
 * Stanley/Barker scraper (Shopify)
 * Collection: https://www.stanleybarker.co.uk/collections/books
 * Product pages: /products/{handle}
 * Artist: p.product__text, Title: .product__title, Description: .product__description .rte
 *
 * Run: npx tsx scripts/scrapers/stanleybarker.ts [output-path]
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

const BASE = "https://www.stanleybarker.co.uk";
const COLLECTION_URL = `${BASE}/collections/books`;

function getProductUrlsFromCollection(html: string): string[] {
  const $ = cheerio.load(html);
  const urls: string[] = [];
  $('a[href*="/products/"]').each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    const path = href.split("?")[0].trim();
    if (!/\/products\/[^/]+\/?$/.test(path)) return;
    const full = normalizeUrl(path, BASE);
    if (!urls.includes(full)) urls.push(full);
  });
  return urls;
}

function getImageUrls($: cheerio.CheerioAPI): string[] {
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
      // ignore
    }
  });

  if (imageUrls.length > 0) return imageUrls;

  $(
    ".product__media img[src], .product-gallery img[src], [data-product-gallery] img[src]",
  ).each((_, el) => {
    const src = $(el).attr("src") || $(el).attr("data-src");
    if (src && !src.startsWith("data:")) {
      const full = normalizeUrl(src, BASE);
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

  const title = $(".product__title h1").first().text().trim() || "";

  const artist =
    $("p.product__text").first().text().trim() ||
    $(".product__text").first().text().trim() ||
    "";

  const description =
    $(".product__description .rte").first().text().trim() ||
    $(".product__description").first().text().trim() ||
    $(".quick-add-hidden .rte").first().text().trim() ||
    $('meta[name="description"]').attr("content")?.trim() ||
    "";

  const imageUrls = getImageUrls($);
  const coverUrl = imageUrls[0] ?? "";
  const images = imageUrls.slice(1).join("|");

  const $body = $("body");
  const isSoldOut =
    $body.text().toLowerCase().includes("sold out") ||
    $(".product-form__submit").hasClass("disabled") ||
    $('[name="add"]').hasClass("disabled");
  const availability = isSoldOut ? "sold-out" : "available";

  const purchaseLink =
    $('link[rel="canonical"]').attr("href")?.trim() ||
    $('meta[property="og:url"]').attr("content")?.trim() ||
    productUrl;
  const finalPurchaseLink = purchaseLink.startsWith("http")
    ? purchaseLink
    : normalizeUrl(purchaseLink, BASE);

  const artistExists = await artistExistsInDb(artist);

  return {
    title,
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
    process.argv[2] ?? join(process.cwd(), "output", "stanleybarker-books.csv");

  console.log("Fetching collection...");
  const collectionHtml = await fetchHtml(COLLECTION_URL);
  const urls = getProductUrlsFromCollection(collectionHtml);

  // Shopify pagination: ?page=2, ?page=3...
  for (let page = 2; page <= 20; page++) {
    try {
      const pageHtml = await fetchHtml(`${COLLECTION_URL}?page=${page}`);
      const pageUrls = getProductUrlsFromCollection(pageHtml);
      if (pageUrls.length === 0) break;
      pageUrls.forEach((u) => {
        if (!urls.includes(u)) urls.push(u);
      });
    } catch {
      break;
    }
  }

  const unique = [...new Set(urls)];
  console.log(`Found ${unique.length} product URLs`);

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

  for (let i = 0; i < unique.length; i++) {
    const url = unique[i];
    console.log(`[${i + 1}/${unique.length}] ${url}`);
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
