/**
 * Poursuite Editions scraper
 * Fetches book data from https://www.poursuite-editions.org/?lang=en
 * and writes CSV with: title, artist, artistExistsInDb, description, specs,
 * coverUrl, images, availability, purchaseLink
 *
 * Run: npx tsx scripts/scrapers/poursuite.ts [output-path]
 */

import * as cheerio from "cheerio";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import {
  artistExistsInDb,
  fetchHtml,
  normalizeUrl,
  rowToCsv,
} from "../scraperUtils";

const BASE = "https://www.poursuite-editions.org";
const CATALOG_URL = `${BASE}/?lang=en`;
const AMOUNT_OF_BOOKS = 10;

async function getAllProductUrls(): Promise<string[]> {
  console.log("Fetching catalog:", CATALOG_URL);
  const html = await fetchHtml(CATALOG_URL);
  const $ = cheerio.load(html);
  const seen = new Set<string>();
  const urls: string[] = [];

  $('a[href*="/products/"]').each((_, el) => {
    const href = $(el).attr("href");
    if (!href || href.includes("add-to-cart")) return;
    const pathOnly = href.split("?")[0];
    const full = normalizeUrl(pathOnly, BASE);
    const path = new URL(full).pathname;
    if (!path.startsWith("/products/")) return;
    const productPath = path.replace(/\/$/, "");
    if (productPath === "/products") return;
    const withLang = `${full}${full.includes("?") ? "&" : "?"}lang=en`;
    if (!seen.has(withLang)) {
      seen.add(withLang);
      urls.push(withLang);
    }
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

  const title =
    $("h1.product_title.entry-title").first().text().trim() ||
    $("h1.entry-title").first().text().trim() ||
    $('meta[property="og:title"]')
      .attr("content")
      ?.replace(/\s*[-–|]\s*Poursuite\s*$/i, "")
      .trim() ||
    "";

  const artist =
    $("h5.elementor-heading-title a").first().text().trim() ||
    $(".woocommerce-product-details__short-description")
      .prev()
      .find("h5 a")
      .first()
      .text()
      .trim() ||
    "";

  const descriptionBlock = $(
    ".elementor-widget-woocommerce-product-content .elementor-widget-container",
  ).first();
  const mainDescription = descriptionBlock
    .find("p")
    .toArray()
    .map((p) => $(p).text().trim().replace(/\s+/g, " "))
    .filter(Boolean)
    .join("\n\n");

  const specsEl = $(".woocommerce-product-details__short-description").first();
  const specHtml = specsEl.html() ?? "";
  const shortDescription =
    specHtml
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/\s+/g, " ")
      .trim() || "";

  const description = [mainDescription, shortDescription]
    .filter(Boolean)
    .join("\n\n");

  const imageUrls: string[] = [];
  $(
    ".woocommerce-product-gallery img, .product-gallery img, .elementor-widget-container img",
  ).each((_, el) => {
    const src =
      $(el).attr("data-src") ||
      $(el).attr("data-large_image") ||
      $(el).attr("src");
    if (src && !src.startsWith("data:") && !imageUrls.includes(src)) {
      imageUrls.push(normalizeUrl(src, BASE));
    }
  });
  if (imageUrls.length === 0) {
    const ogImage = $('meta[property="og:image"]').attr("content");
    if (ogImage) imageUrls.push(normalizeUrl(ogImage, BASE));
  }
  const uniqueImages = [...new Set(imageUrls)];
  const coverUrl = uniqueImages[0] ?? "";
  const images = uniqueImages.slice(1).join("|");

  const hasOutOfStock =
    $(".out-of-stock, .outofstock").length > 0 ||
    $("p.stock").filter((_, el) =>
      $(el).text().toLowerCase().includes("out of stock"),
    ).length > 0;
  const availability = hasOutOfStock ? "sold out" : "available";

  const purchaseLink =
    $('link[rel="canonical"]').attr("href")?.trim() || productUrl;

  const artistExists = await artistExistsInDb(artist);

  return {
    title,
    artist,
    artistExistsInDb: artistExists,
    description,
    coverUrl,
    images,
    availability,
    purchaseLink: purchaseLink.startsWith("http")
      ? purchaseLink
      : normalizeUrl(purchaseLink, BASE),
  };
}

async function main() {
  const outPath =
    process.argv[2] ?? join(process.cwd(), "output", "poursuite.csv");

  console.log("Fetching product list...");
  const productUrls = (await getAllProductUrls()).slice(0, AMOUNT_OF_BOOKS);
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
      lines.push(
        rowToCsv({
          ...row,
          artistExistsInDb: row.artistExistsInDb,
        }),
      );
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
