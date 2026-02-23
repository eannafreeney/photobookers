/**
 * Skinnerboox scraper
 * Base: https://www.skinnerboox.com
 * Category: ?category=PHOTOBOOKS
 * Product pages: /books/{slug}
 * Title: left of " - " in h1.product-title, Artist: right of " - "
 * Description: .product-excerpt
 *
 * Run: npx tsx scripts/scrapers/skinnerboox.ts [output-path]
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

const BASE = "https://www.skinnerboox.com";
const COLLECTION_URL = `${BASE}/?category=PHOTOBOOKS`;

function getProductUrls(collectionHtml: string): string[] {
  const $ = cheerio.load(collectionHtml);
  const urls: string[] = [];
  $('a[href*="/books/"]').each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    const path = href.split("?")[0].split("#")[0];
    if (!/\/books\/[^/]+\/?$/.test(path)) return;
    const full = normalizeUrl(path, BASE);
    if (!urls.includes(full)) urls.push(full);
  });
  return urls;
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

  const fullTitleRaw = $("h1.product-title").first().text().trim();
  const fullTitle = decodeHtmlEntities(fullTitleRaw);
  const dashIndex = fullTitle.indexOf(" - ");
  const title =
    dashIndex >= 0 ? fullTitle.slice(0, dashIndex).trim() : fullTitle;
  const artist = dashIndex >= 0 ? fullTitle.slice(dashIndex + 3).trim() : "";

  const description =
    $(".product-excerpt").first().text().trim() ||
    $('meta[name="description"]').attr("content")?.trim() ||
    "";

  const ogImage = $('meta[property="og:image"]').attr("content");
  const imageUrls: string[] = [];
  if (ogImage && !ogImage.startsWith("data:")) {
    imageUrls.push(normalizeUrl(ogImage, BASE));
  }
  $("#flowThumbnail img[data-image], #flowThumbnail img[src]").each((_, el) => {
    const src = $(el).attr("data-image") || $(el).attr("src");
    if (src && !src.startsWith("data:")) {
      const u = normalizeUrl(src, BASE);
      if (!imageUrls.includes(u)) imageUrls.push(u);
    }
  });
  $(
    "#flowItems .flow-item img[data-image], #flowItems .flow-item img[src]",
  ).each((_, el) => {
    const src = $(el).attr("data-image") || $(el).attr("src");
    if (src && !src.startsWith("data:")) {
      const u = normalizeUrl(src, BASE);
      if (!imageUrls.includes(u)) imageUrls.push(u);
    }
  });
  const uniqueImages = [...new Set(imageUrls)];
  const coverUrl = uniqueImages[0] ?? "";
  const images = uniqueImages.slice(1).join("|");

  const hasSoldOut =
    $(".product-mark.sold-out").length > 0 ||
    /sold\s*out/i.test($(".product-price").text());
  const availability = hasSoldOut ? "sold out" : "available";

  const purchaseLink =
    $('link[rel="canonical"]').attr("href")?.trim() || productUrl;
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
    process.argv[2] ?? join(process.cwd(), "output", "skinnerboox-books.csv");

  console.log("Fetching PHOTOBOOKS list...");
  const collectionHtml = await fetchHtml(COLLECTION_URL);
  const urls = getProductUrls(collectionHtml);
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
