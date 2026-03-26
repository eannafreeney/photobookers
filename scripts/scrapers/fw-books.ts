/**
 * Fw:Books scraper
 * Fetches product URLs from: https://fw-books.nl/product-category/books/
 * Then scrapes each product page and writes CSV with:
 *   - title (book title, derived from product H1 before/after " - ")
 *   - artist (artist, derived from product H1 before " - ")
 *   - artistExistsInDb
 *   - description (short specs + the next descriptive paragraph)
 *   - coverUrl
 *   - images (gallery URLs, separated by "|", excluding coverUrl)
 *   - availability
 *   - purchaseLink
 *
 * Run: npx tsx scripts/scrapers/fw-books.ts [output-path]
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

const BASE = "https://fw-books.nl";
const COLLECTION_URL = `${BASE}/product-category/books/`;

function splitArtistAndTitle(raw: string): { artist: string; title: string } {
  const cleaned = decodeHtmlEntities(raw).replace(/\s+/g, " ").trim();

  // Product title format looks like:
  //   "Farren van Wyk — Mixedness is my Mythology (signed pre-order)"
  // We split on the first " — " (or " - ") delimiter.
  const parts = cleaned.split(/\s[—-]\s/, 2);
  if (parts.length === 2) {
    return { artist: parts[0].trim(), title: parts[1].trim() };
  }

  // Fallback: if no delimiter, treat the whole thing as the title.
  return { artist: cleaned, title: cleaned };
}

function getProductUrlsFromCollectionHtml(html: string): string[] {
  const $ = cheerio.load(html);
  const seen = new Set<string>();
  const urls: string[] = [];

  $('a[href*="/product/"]').each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;

    const withoutQuery = href.split("?")[0].trim();
    const full = normalizeUrl(withoutQuery, BASE);
    if (!full.startsWith(BASE)) return;

    try {
      const pathname = new URL(full).pathname;
      // Accept:
      //   /product/<slug>/
      if (!/^\/product\/[^/]+\/?$/.test(pathname)) return;
    } catch {
      return;
    }

    if (!seen.has(full)) {
      seen.add(full);
      urls.push(full);
    }
  });

  return urls;
}

function getGalleryImageUrls($: cheerio.CheerioAPI): string[] {
  const urls: string[] = [];
  const pushUnique = (u: string | undefined | null) => {
    if (!u) return;
    const trimmed = String(u).trim();
    if (!trimmed || trimmed.startsWith("data:")) return;
    const normalized = trimmed.startsWith("http")
      ? trimmed
      : normalizeUrl(trimmed, BASE);
    if (!urls.includes(normalized)) urls.push(normalized);
  };

  // Primary: gallery lightbox hrefs are full-size image links.
  $(
    ".woo-product-gallery-slider a.wpgs-lightbox-icon[href], .woo-product-gallery-slider a[href]",
  ).each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    if (
      href.includes(".jpg") ||
      href.includes(".png") ||
      href.includes(".jpeg")
    ) {
      pushUnique(href);
    }
  });

  if (urls.length > 0) return urls;

  // Fallback: images with data-large_image.
  $(`img[data-large_image]`).each((_, el) => {
    pushUnique($(el).attr("data-large_image"));
  });

  if (urls.length > 0) return urls;

  // Last resort: og:image.
  const ogImage = $('meta[property="og:image"]').attr("content");
  pushUnique(ogImage);

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

  const rawH1 =
    $("h1.product_title.entry-title").first().text().trim() ||
    $("h1.entry-title").first().text().trim() ||
    $('meta[property="og:title"]').attr("content")?.trim() ||
    "";

  const { artist, title } = splitArtistAndTitle(rawH1);

  const shortDiv = $(".woocommerce-product-details__short-description").first();
  const shortSpecs = shortDiv.text().trim();
  const longDescriptionParagraph = shortDiv.nextAll("p").first().text().trim();
  const descriptionParts = [shortSpecs, longDescriptionParagraph].filter(
    Boolean,
  );
  const description = descriptionParts.join("\n\n");

  const imageUrls = getGalleryImageUrls($);
  const uniqueImages = [...new Set(imageUrls)];
  const coverUrl = uniqueImages[0] ?? "";
  const images = uniqueImages.slice(1).join("|");

  const $body = $("body");
  const bodyText = $body.text().toLowerCase();
  const isSoldOut =
    bodyText.includes("sold out") ||
    bodyText.includes("out of stock") ||
    $("button.single_add_to_cart_button").hasClass("disabled") ||
    $("button.single_add_to_cart_button[disabled]").length > 0;

  // `scripts/import.ts` maps exactly "sold out" -> "sold_out".
  const availability = isSoldOut ? "sold out" : "available";

  const canonical =
    $('link[rel="canonical"]').attr("href")?.trim() || productUrl || "";
  const purchaseLink = canonical.startsWith("http")
    ? canonical
    : normalizeUrl(canonical, BASE);

  const artistExists = await artistExistsInDb(artist);

  return {
    title,
    artist,
    artistExistsInDb: artistExists,
    description,
    coverUrl,
    images,
    availability,
    purchaseLink,
  };
}

async function main() {
  const outPath = process.argv[2] ?? join(process.cwd(), "output", "fw.csv");

  console.log("Fetching product list...");
  const html = await fetchHtml(COLLECTION_URL);
  const productUrls = getProductUrlsFromCollectionHtml(html);
  console.log(`Found ${productUrls.length} product URLs.`);

  const finalProductUrls = [...productUrls].slice(0, 15);

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

  for (let i = 0; i < finalProductUrls.length; i++) {
    const url = finalProductUrls[i];
    console.log(`[${i + 1}/${finalProductUrls.length}] ${url}`);
    try {
      const row = await scrapeProduct(url);
      lines.push(rowToCsv(row));
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
