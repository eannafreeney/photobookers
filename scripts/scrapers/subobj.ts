/**
 * Subjectively Objective scraper (WooCommerce)
 * Collection: https://subjectivelyobjective.com/product-category/books/
 * Product pages: /product/{slug}/
 * h1.product_title.entry-title = "Artist – Title" → artist + title, no description
 * Max 5 images (cover + 4 in images).
 *
 * Run: npx tsx scripts/scrapers/subobj.ts [output-path]
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

const BASE = "https://subjectivelyobjective.com";
const COLLECTION_URL = `${BASE}/product-category/books/`;
const MAX_IMAGES = 5;

function getProductUrlsFromCategory(html: string): string[] {
  const $ = cheerio.load(html);
  const urls: string[] = [];
  $('a[href*="/product/"]').each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    const path = href.split("?")[0].trim();
    if (/\/product-category\//.test(path)) return;
    if (!/\/product\/[^/]+\/?$/.test(path)) return;
    const full = normalizeUrl(path.replace(/\/$/, "") || path, BASE);
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
      const data = JSON.parse(text) as {
        "@type"?: string;
        image?: string | string[];
      };
      if (data["@type"] === "Product" && data.image) {
        const arr = Array.isArray(data.image) ? data.image : [data.image];
        for (const url of arr) {
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

  if (imageUrls.length >= MAX_IMAGES) return imageUrls.slice(0, MAX_IMAGES);

  $(".woocommerce-product-gallery a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (
      href &&
      /\.(jpe?g|png|webp|gif)(\?|$)/i.test(href) &&
      !href.startsWith("data:")
    ) {
      const full = normalizeUrl(href, BASE);
      if (!imageUrls.includes(full)) imageUrls.push(full);
    }
  });

  $(
    ".woocommerce-product-gallery img[src], .woocommerce-product-gallery img[data-src], .woocommerce-product-gallery img[data-large_image], .product img[src], .product img[data-src]",
  ).each((_, el) => {
    const $el = $(el);
    const src =
      $el.attr("src") || $el.attr("data-src") || $el.attr("data-large_image");
    if (src && !src.startsWith("data:")) {
      const full = normalizeUrl(src, BASE);
      if (!imageUrls.includes(full)) imageUrls.push(full);
    }
  });

  if (imageUrls.length === 0) {
    const ogImage = $('meta[property="og:image"]').attr("content");
    if (ogImage && !ogImage.startsWith("data:")) {
      imageUrls.push(normalizeUrl(ogImage, BASE));
    }
  }

  return imageUrls.slice(0, MAX_IMAGES);
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

  const heading =
    $("h1.product_title.entry-title").first().text().trim() ||
    $("h1.entry-title").first().text().trim() ||
    "";

  const sep = " – ";
  const sepIndex = heading.indexOf(sep);
  const artist = sepIndex > 0 ? heading.slice(0, sepIndex).trim() : "";
  const title =
    sepIndex > 0 ? heading.slice(sepIndex + sep.length).trim() : heading;

  const description = "";

  const imageUrls = getImageUrls($);
  const coverUrl = imageUrls[0] ?? "";
  const images = imageUrls.slice(1).join("|");

  const $body = $("body");
  const isSoldOut =
    $body.text().toLowerCase().includes("out of stock") ||
    $(".outofstock").length > 0 ||
    $("p.stock.out-of-stock").length > 0;
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
    process.argv[2] ??
    join(process.cwd(), "output", "subjectivelyobjective-books.csv");

  console.log("Fetching category...");
  const collectionHtml = await fetchHtml(COLLECTION_URL);
  const urls = getProductUrlsFromCategory(collectionHtml);

  for (let page = 2; page <= 20; page++) {
    try {
      const pageUrl = `${BASE}/product-category/books/page/${page}/`;
      const pageHtml = await fetchHtml(pageUrl);
      const pageUrls = getProductUrlsFromCategory(pageHtml);
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
