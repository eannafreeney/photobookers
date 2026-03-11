/**
 * RRB Photobooks scraper
 * Listing: https://rrbphotobooks.com/collections/books?filter.p.m.custom.book_publisher=RRB+Photobooks
 * Product pages: /products/{handle}
 * Title: [data-block-id="title"]
 * Artist: a.vendor.h6
 * Description: .liquid + .accordion_content
 *
 * Run: npx tsx scripts/scrapers/rrbphotobooks.ts [output-path]
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

const BASE = "https://rrbphotobooks.com";
const COLLECTION_URL = `${BASE}/collections/books?filter.p.m.custom.book_publisher=RRB+Photobooks`;
const MAX_IMAGES = 7;

function getProductUrlsFromHtml(html: string): string[] {
  const $ = cheerio.load(html);
  const urls: string[] = [];
  $('a[href*="/products/"]').each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    const path = href.split("?")[0].trim();
    if (!/\/products\/[^/]+\/?$/.test(path)) return;
    const full = normalizeUrl(path.replace(/\/$/, ""), BASE);
    if (!urls.includes(full)) urls.push(full);
  });
  return urls;
}

async function getAllProductUrls(): Promise<string[]> {
  const seen = new Set<string>();
  const all: string[] = [];
  let page = 1;

  for (;;) {
    const url = page === 1 ? COLLECTION_URL : `${COLLECTION_URL}&page=${page}`;
    console.log(`Fetching collection page ${page}...`);
    const html = await fetchHtml(url);
    const urls = getProductUrlsFromHtml(html);
    if (urls.length === 0) break;
    let added = 0;
    for (const u of urls) {
      if (!seen.has(u)) {
        seen.add(u);
        all.push(u);
        added++;
      }
    }
    if (added === 0) break;
    page++;
  }

  return all;
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
      /* ignore */
    }
  });

  $(
    ".product__media img[src], .product-single__photo img[src], [data-product-gallery] img[src], .product-gallery img[src]",
  ).each((_, el) => {
    const src = $(el).attr("src") || $(el).attr("data-src");
    if (src && !src.startsWith("data:")) {
      const full = normalizeUrl(src, BASE);
      if (!imageUrls.includes(full)) imageUrls.push(full);
    }
  });

  if (imageUrls.length === 0) {
    const og = $('meta[property="og:image"]').attr("content");
    if (og) imageUrls.push(normalizeUrl(og, BASE));
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

  const title = decodeHtmlEntities(
    $('[data-block-id="title"]').first().text().trim() ||
      $("h1").first().text().trim() ||
      $('meta[property="og:title"]').attr("content")?.trim() ||
      "",
  );

  const artist = decodeHtmlEntities(
    $("a.vendor.h6").first().text().trim() ||
      $("a.vendor").first().text().trim() ||
      $(".vendor").first().text().trim() ||
      "",
  );

  const descParts: string[] = [];
  $(".liquid").each((_, el) => {
    const text = $(el).text().trim();
    if (text) descParts.push(text);
  });
  $(".accordion_content").each((_, el) => {
    const text = $(el).text().trim();
    if (text) descParts.push(text);
  });
  const description = decodeHtmlEntities(descParts.join("\n\n").trim());

  const imageUrls = getImageUrls($);
  const coverUrl = imageUrls[0] ?? "";
  const images = imageUrls.slice(1).join("|");

  const bodyText = $("body").text().toLowerCase();
  const isSoldOut =
    bodyText.includes("sold out") ||
    $(".sold-out, [data-sold-out], .product-form--sold-out").length > 0;
  const availability = isSoldOut ? "sold-out" : "available";

  const purchaseLink =
    $('link[rel="canonical"]').attr("href")?.trim() ||
    $('meta[property="og:url"]').attr("content")?.trim() ||
    productUrl.split("?")[0];
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
    process.argv[2] ?? join(process.cwd(), "output", "rrbphotobooks-books.csv");

  console.log("Fetching product URLs from collection...");
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
