/**
 * SUPER LABO scraper (Shopify)
 * Collection: https://superlabo.com/collections/super-labo
 * Product pages: /products/{handle} or /collections/super-labo/products/{handle}
 * h1.product__title = "Title<br>Artist" → title before <br/>, artist after
 * Description: .product__description (truncated--disabled)
 *
 * Run: npx tsx scripts/scrapers/superlabo.ts [output-path]
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

const BASE = "https://superlabo.com";
const COLLECTION_URL = `${BASE}/collections/super-labo`;
const MAX_IMAGES = 7;

function getProductUrlsFromCollection(html: string): string[] {
  const $ = cheerio.load(html);
  const urls: string[] = [];
  $('a[href*="/products/"]').each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    const path = href.split("?")[0].trim();
    const match = path.match(/\/products\/([^/]+)/);
    if (!match) return;
    const full = `${BASE}/products/${match[1]}`;
    if (!urls.includes(full)) urls.push(full);
  });
  return urls;
}

function getImageUrls($: cheerio.CheerioAPI): string[] {
  const imageUrls: string[] = [];

  const productJson = $("script#ProductJson-product").html()?.trim();
  if (productJson) {
    try {
      const data = JSON.parse(productJson) as {
        images?: string[];
        featured_image?: string;
      };
      if (data.featured_image) {
        const url = data.featured_image.startsWith("//")
          ? `https:${data.featured_image}`
          : data.featured_image.startsWith("/")
            ? `${BASE}${data.featured_image}`
            : data.featured_image;
        if (!imageUrls.includes(url)) imageUrls.push(url);
      }
      if (Array.isArray(data.images)) {
        for (const src of data.images) {
          if (!src || typeof src !== "string" || src.startsWith("data:"))
            continue;
          const url = src.startsWith("//")
            ? `https:${src}`
            : src.startsWith("/")
              ? `${BASE}${src}`
              : src;
          if (!imageUrls.includes(url)) imageUrls.push(url);
        }
      }
    } catch {
      // ignore
    }
  }

  if (imageUrls.length >= MAX_IMAGES) return imageUrls.slice(0, MAX_IMAGES);

  $(
    ".product-gallery__item img[src], .product-gallery__item img[data-src], .product-gallery img[src]",
  ).each((_, el) => {
    const src = $(el).attr("src") || $(el).attr("data-src");
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

  const titleEl = $("h1.product__title").first();
  const titleHtml = titleEl.html() ?? "";
  const parts = titleHtml
    .split(/<br\s*\/?>/i)
    .map((s) => decodeHtmlEntities(s).trim())
    .filter(Boolean);
  const title = parts[0] ?? "";
  const artist = parts[1] ?? "";

  const descEl = $(
    ".product__description.truncated--disabled .rte, .product__description .rte, .product__description",
  ).first();
  let description = "";
  if (descEl.length) {
    const descHtml = descEl.html() ?? "";
    description = decodeHtmlEntities(descHtml)
      .replace(/<\/p>\s*/gi, "\n")
      .replace(/<p[^>]*>/gi, "\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/[ \t]+/g, " ")
      .replace(/\n[ \t]+/g, "\n")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  const imageUrls = getImageUrls($);
  const coverUrl = imageUrls[0] ?? "";
  const images = imageUrls.slice(1).join("|");

  const availabilityMeta = $('meta[property="product:availability"]').attr(
    "content",
  );
  const bodyText = $("body").text().toLowerCase();
  const isSoldOut =
    availabilityMeta?.toLowerCase() === "out of stock" ||
    bodyText.includes("sold out") ||
    $(".product-form__submit").text().toLowerCase().includes("sold out");
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
    process.argv[2] ?? join(process.cwd(), "output", "superlabo-books.csv");

  console.log("Fetching collection...");
  const seen = new Set<string>();
  const urls: string[] = [];
  let page = 1;

  for (;;) {
    const pageUrl =
      page === 1 ? COLLECTION_URL : `${COLLECTION_URL}?page=${page}`;
    try {
      const html = await fetchHtml(pageUrl);
      const pageUrls = getProductUrlsFromCollection(html);
      if (pageUrls.length === 0) break;
      let added = 0;
      for (const u of pageUrls) {
        if (!seen.has(u)) {
          seen.add(u);
          urls.push(u);
          added++;
        }
      }
      if (added === 0) break;
      page++;
    } catch {
      break;
    }
  }

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
