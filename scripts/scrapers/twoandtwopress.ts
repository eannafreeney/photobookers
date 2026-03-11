/**
 * Marc Wilson photobooks scraper
 * https://www.marcwilson.co.uk/book-print-sales/photobooks
 * Title: h1.product-title
 * Artist: always "Marc Wilson"
 * Description: .product-description
 *
 * Run: npx tsx scripts/scrapers/marcwilson.ts [output-path]
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

const BASE = "https://www.marcwilson.co.uk/book-print-sales/photobooks";
const LISTING_URL = BASE;
const ARTIST = "Marc Wilson";
const MAX_IMAGES = 7;

function getProductUrlsFromListing(html: string): string[] {
  const $ = cheerio.load(html);
  const urls: string[] = [];
  const productPathPrefix = "/book-print-sales/p/";
  const origin = "https://www.marcwilson.co.uk";
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:")) return;
    let full: string;
    try {
      const url = new URL(href, origin + "/");
      if (url.origin !== origin) return;
      // Product pages: /book-print-sales/p/{slug} (e.g. /p/ontheroad, /p/onenight)
      if (!url.pathname.startsWith(productPathPrefix)) return;
      const after = url.pathname.slice(productPathPrefix.length).split("/")[0];
      if (!after) return;
      full = url.origin + url.pathname.replace(/\/$/, "");
      if (!full.endsWith("/")) full += "/";
      if (!urls.includes(full)) urls.push(full);
    } catch {
      return;
    }
  });
  return urls;
}

function getImageUrls($: cheerio.CheerioAPI): string[] {
  const imageUrls: string[] = [];

  $(".product-description img[src], .product-description img[data-src]").each(
    (_, el) => {
      const url = $(el).attr("src") || $(el).attr("data-src");
      if (url && !url.startsWith("data:")) {
        const full = normalizeUrl(url, BASE);
        if (!imageUrls.includes(full)) imageUrls.push(full);
      }
    },
  );

  $(
    ".product-gallery img[src], .product-gallery img[data-src], .product-single__photo img[src], [data-product-gallery] img[src]",
  ).each((_, el) => {
    const url = $(el).attr("src") || $(el).attr("data-src");
    if (url && !url.startsWith("data:")) {
      const full = normalizeUrl(url, BASE);
      if (!imageUrls.includes(full)) imageUrls.push(full);
    }
  });

  if (imageUrls.length === 0) {
    $(".product-description img, .product img, main img").each((_, el) => {
      const src = $(el).attr("src") || $(el).attr("data-src");
      if (src && !src.startsWith("data:")) {
        const full = normalizeUrl(src, BASE);
        if (!imageUrls.includes(full)) imageUrls.push(full);
      }
    });
  }

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
    $("h1.product-title").first().text().trim() ||
      $('meta[property="og:title"]').attr("content")?.trim() ||
      "",
  );

  const description = $(".product-description").first().text().trim();
  const descriptionClean = decodeHtmlEntities(description);

  const imageUrls = getImageUrls($);
  const coverUrl = imageUrls[0] ?? "";
  const images = imageUrls.slice(1).join("|");

  const bodyText = $("body").text().toLowerCase();
  const isSoldOut =
    bodyText.includes("sold out") ||
    bodyText.includes("out of stock") ||
    $(".sold-out, [data-sold-out], .out-of-stock").length > 0;
  const isLimited =
    bodyText.includes("limited availability") ||
    $("[data-availability='limited']").length > 0;
  const availability = isSoldOut
    ? "sold-out"
    : isLimited
      ? "limited"
      : "available";

  const purchaseLink =
    $('link[rel="canonical"]').attr("href")?.trim() ||
    $('meta[property="og:url"]').attr("content")?.trim() ||
    productUrl;
  const finalPurchaseLink = purchaseLink.startsWith("http")
    ? purchaseLink
    : normalizeUrl(purchaseLink, BASE);

  const artistExists = await artistExistsInDb(ARTIST);

  return {
    title,
    artist: ARTIST,
    artistExistsInDb: artistExists,
    description: descriptionClean,
    coverUrl,
    images,
    availability,
    purchaseLink: finalPurchaseLink,
  };
}

async function main() {
  const outPath =
    process.argv[2] ??
    join(process.cwd(), "output", "marcwilson-photobooks.csv");

  console.log("Fetching listing:", LISTING_URL);
  const listingHtml = await fetchHtml(LISTING_URL);
  let urls = getProductUrlsFromListing(listingHtml);

  const seen = new Set<string>();
  const unique = urls.filter((u) => {
    const n = u.replace(/\/$/, "");
    if (seen.has(n)) return false;
    seen.add(n);
    return true;
  });

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
