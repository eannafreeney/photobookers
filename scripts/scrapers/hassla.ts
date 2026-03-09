/**
 * Hassla Books scraper
 * https://hasslabooks.com/
 * Fetches book data and writes CSV: title, artist, artistExistsInDb, description,
 * coverUrl, images, availability, purchaseLink
 *
 * Run: npx tsx scripts/scrapers/hassla.ts [output-path]
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

const BASE = "https://hasslabooks.com";

const URLS_TO_TRY = [`${BASE}/`];

function getProductUrls(html: string, baseUrl: string): string[] {
  const $ = cheerio.load(html);
  const seen = new Set<string>();
  const urls: string[] = [];

  $('a[href*="/products/"]').each((_, el) => {
    const href = $(el).attr("href");
    if (!href || href.includes("add") || href.includes("cart")) return;
    const pathOnly = href.split("?")[0].trim();
    const full = normalizeUrl(pathOnly, BASE);
    const path = new URL(full).pathname;
    const match = path.match(/\/products\/([^/]+)/);
    if (!match) return;
    const productUrl = `${BASE}/products/${match[1]}`;
    if (!seen.has(productUrl)) {
      seen.add(productUrl);
      urls.push(productUrl);
    }
  });

  return urls;
}

async function getAllProductUrls(): Promise<string[]> {
  const allUrls: string[] = [];
  const seen = new Set<string>();

  try {
    console.log("Fetching:", BASE);
    const html = await fetchHtml(BASE);
    const urls = getProductUrls(html, BASE);
    for (const u of urls) {
      if (!seen.has(u)) {
        seen.add(u);
        allUrls.push(u);
      }
    }
  } catch (e) {
    console.warn("Failed or no products:", BASE, (e as Error).message);
  }

  return allUrls;
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

  const rawTitle =
    $("h1.product-title").first().text().trim() ||
    $("h1.title").first().text().trim() ||
    $("h1").first().text().trim() ||
    $('meta[property="og:title"]')
      .attr("content")
      ?.replace(/\s*[-–|]\s*Hassla\s*$/i, "")
      .trim() ||
    "";

  // "Artist – Title" or "Artist - Title"
  const dashSep = rawTitle.indexOf(" – ") >= 0 ? " – " : " - ";
  const dashIdx = rawTitle.indexOf(dashSep);
  const artist = dashIdx >= 0 ? rawTitle.slice(0, dashIdx).trim() : "";
  const title =
    dashIdx >= 0 ? rawTitle.slice(dashIdx + dashSep.length).trim() : rawTitle;

  let description =
    $(".product-description").first().text().trim() ||
    $(".product__description").first().text().trim() ||
    $("[data-product-description], .description").first().text().trim() ||
    $('meta[property="og:description"]').attr("content")?.trim() ||
    "";
  description = decodeHtmlEntities(description).replace(/\s+/g, " ").trim();

  const imageUrls: string[] = [];
  $(
    ".product-gallery img, .product__media img, .product img, [data-product-images] img, .product-photo-container img",
  ).each((_, el) => {
    const src =
      $(el).attr("data-src") || $(el).attr("data-zoom") || $(el).attr("src");
    if (src && !src.startsWith("data:") && !imageUrls.includes(src)) {
      imageUrls.push(normalizeUrl(src, BASE));
    }
  });
  if (imageUrls.length === 0) {
    const og = $('meta[property="og:image"]').attr("content");
    if (og) imageUrls.push(normalizeUrl(og, BASE));
  }
  const uniqueImages = [...new Set(imageUrls)];
  const coverUrl = uniqueImages[0] ?? "";
  const images = uniqueImages.slice(1).join("|");

  const bodyText = $("body").text().toLowerCase();
  const outOfPrint =
    bodyText.includes("out of print") || bodyText.includes("out of stock");
  const soldOut =
    $(".sold-out, .out-of-stock, [data-sold-out]").length > 0 ||
    $("[disabled]").filter((_, el) =>
      $(el).text().toLowerCase().includes("sold out"),
    ).length > 0;
  const availability = outOfPrint || soldOut ? "sold out" : "available";

  const purchaseLink =
    $('link[rel="canonical"]').attr("href")?.trim() ||
    $('meta[property="og:url"]').attr("content")?.trim() ||
    productUrl;
  const finalLink = purchaseLink.startsWith("http")
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
    purchaseLink: finalLink,
  };
}

async function main() {
  const outPath =
    process.argv[2] ?? join(process.cwd(), "output", "hassla.csv");

  console.log("Fetching product URLs...");
  const productUrls = await getAllProductUrls();
  console.log(`Found ${productUrls.length} product URLs.`);

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
