/**
 * Brown Owl Press scraper
 * Base: https://www.brownowlpress.com/
 * Product pages: /product/{handle}
 * h1.product-title = "Artist - Title" → artist + title
 * Description: .product-description
 *
 * Run: npx tsx scripts/scrapers/brownowl.ts [output-path]
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

const BASE = "https://www.brownowlpress.com";
const COLLECTION_URL = `${BASE}/`;
const MAX_IMAGES = 7;

function getProductUrls(html: string): string[] {
  const $ = cheerio.load(html);
  const urls: string[] = [];
  $('a[href*="/product/"]').each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    const path = href.split("?")[0].trim();
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

  $(
    ".product-gallery img[src], .product__media img[src], .product img[src]",
  ).each((_, el) => {
    const $el = $(el);
    const src = $el.attr("src") || $el.attr("data-src");
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

  const heading = $("h1.product-title").first().text().trim() || "";

  // "Anastasia Davis - Letting Go" → artist = "Anastasia Davis", title = "Letting Go"
  const sep = " - ";
  const sepIndex = heading.indexOf(sep);
  const artist = sepIndex > 0 ? heading.slice(0, sepIndex).trim() : "";
  const title =
    sepIndex > 0 ? heading.slice(sepIndex + sep.length).trim() : heading;

  const description =
    $(".product-description").first().text().trim() ||
    $('meta[name="description"]').attr("content")?.trim() ||
    "";

  const imageUrls = getImageUrls($);
  const coverUrl = imageUrls[0] ?? "";
  const images = imageUrls.slice(1).join("|");

  const $body = $("body");
  const isSoldOut =
    $body.text().toLowerCase().includes("sold out") ||
    $body.text().toLowerCase().includes("out of stock");
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
    process.argv[2] ?? join(process.cwd(), "output", "brownowl-books.csv");

  console.log("Fetching collection...");
  const collectionHtml = await fetchHtml(COLLECTION_URL);
  const urls = getProductUrls(collectionHtml);

  // If site has pagination (e.g. /page/2 or ?page=2), add a loop here
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
