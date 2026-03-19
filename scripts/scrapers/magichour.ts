/**
 * Magic Hour Press scraper (Shopify)
 * Collection: https://magichour.press/collections/all
 * Product pages: /products/{handle}
 * Title: h1, Artist: h2, Description: .text-block (in DESCRIPTION tab)
 *
 * Run: npx tsx scripts/scrapers/magichour.ts [output-path]
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

const BASE = "https://magichour.press";
const COLLECTION_URL = `${BASE}/collections/all`;
const MAX_IMAGES = 7;

function getProductUrls(html: string): string[] {
  const $ = cheerio.load(html);
  const urls: string[] = [];
  $('a[href*="/products/"]').each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    const path = href.split("?")[0].trim();
    if (!/\/products\/[^/]+\/?$/.test(path)) return;
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
        const imgs = Array.isArray(data.image) ? data.image : [data.image];
        for (const url of imgs) {
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

  if (imageUrls.length > 0) return imageUrls.slice(0, MAX_IMAGES);

  $(".product-media__image").each((_, el) => {
    const src = $(el).attr("src");
    if (src && !src.startsWith("data:")) {
      const full = normalizeUrl(src, BASE);
      if (!imageUrls.includes(full)) imageUrls.push(full);
    }
  });

  if (imageUrls.length > 0) return imageUrls.slice(0, MAX_IMAGES);

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

  const productDetails = $(
    "#ProductInformation-template--16999251804269__product-information, .product-details, [data-testid='product-information-details']",
  ).first();

  const title =
    productDetails.find("h1").first().text().trim() ||
    $('meta[property="og:title"]')
      .attr("content")
      ?.replace(/\s*[-|—]\s*Magic Hour Press\s*$/i, "")
      .trim() ||
    "";

  const artist = productDetails.find("h2").first().text().trim() || "";

  const description =
    $(".ai-product-tabs__content.active .text-block").first().text().trim() ||
    $('div[id^="tab-description-"] .text-block').first().text().trim() ||
    $(".ai-product-tabs__content .text-block").first().text().trim() ||
    $('meta[property="og:description"]').attr("content")?.trim() ||
    "";

  const imageUrls = getImageUrls($);
  const coverUrl = imageUrls[0] ?? "";
  const images = imageUrls.slice(1).join("|");

  const $body = $("body");
  const isSoldOut =
    $body.text().toLowerCase().includes("sold out") ||
    $body.text().toLowerCase().includes("unavailable");
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
    process.argv[2] ?? join(process.cwd(), "output", "magichour-books.csv");

  console.log("Fetching collection...");
  const allUrls = new Set<string>();
  let collectionHtml = await fetchHtml(COLLECTION_URL);
  getProductUrls(collectionHtml).forEach((u) => allUrls.add(u));

  for (let page = 2; page <= 20; page++) {
    try {
      const pageHtml = await fetchHtml(`${COLLECTION_URL}?page=${page}`);
      const pageUrls = getProductUrls(pageHtml);
      if (pageUrls.length === 0) break;
      pageUrls.forEach((u) => allUrls.add(u));
    } catch {
      break;
    }
  }

  const urls = [...allUrls];
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
