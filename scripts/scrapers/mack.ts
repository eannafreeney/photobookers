// scripts/scrapers/mack-new-books.ts
/**
 * MACK "New Books" scraper (Shopify)
 *
 * Usage:
 *   npx tsx scripts/scrapers/mack-new-books.ts [output-path] [pageSize] [maxProducts]
 *
 * Example:
 *   npx tsx scripts/scrapers/mack-new-books.ts output/mack-new-books.csv 250 0
 */

import "../env";

import * as cheerio from "cheerio";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import {
  artistExistsInDb,
  decodeHtmlEntities,
  fetchHtml,
  rowToCsv,
} from "../scraperUtils";

const BASE = "https://mackbooks.co.uk";
const COLLECTION_URL = `${BASE}/collections/new-books`;

type ProductImage = { src: string };
type ProductVariant = { available: boolean };
type ProductsJsonItem = {
  handle: string;
  body_html: string;
  images: ProductImage[];
  variants: ProductVariant[];
  // title is present in JSON, but we re-parse from HTML to match your selectors exactly
};

function cleanText(s: string): string {
  return (s ?? "").replace(/\s+/g, " ").trim();
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { "User-Agent": "PhotobookersScraper/1.0" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return (await res.json()) as T;
}

function parseTitleArtistDescription(html: string): {
  title: string;
  artist: string;
  description: string;
} {
  const $ = cheerio.load(html);

  const title = cleanText($("h1.product__title").first().text());

  // Your page has 2 subtitles (author + imprint). The author is the `.text-size--large` one.
  let artist = cleanText(
    $("span.product__subtitle.text-size--large").first().text(),
  );

  // Sometimes there can be extra whitespace/newlines; cleanText already reduces.
  const descClone = $(".product__description").first().clone();

  // Remove accordion/toggle sections so description is the core blurb.
  descClone.find("toggle-tab").remove();

  // body text may contain html artifacts; cheerio text() gives decoded text.
  const rawDescription = descClone.text();
  const description = cleanText(decodeHtmlEntities(rawDescription));

  return { title, artist, description };
}

function jsonToAvailability(
  product: ProductsJsonItem,
): "sold out" | "available" {
  const variants = product.variants ?? [];
  if (variants.length === 0) return "available";
  const allSoldOut = variants.every((v) => v?.available === false);
  return allSoldOut ? "sold out" : "available";
}

function jsonToCoverAndImages(product: ProductsJsonItem): {
  coverUrl: string;
  images: string;
} {
  const srcs = (product.images ?? [])
    .map((i) => i?.src)
    .filter((s): s is string => typeof s === "string" && s.trim().length > 0);

  const coverUrl = srcs[0] ?? "";
  const galleryImages = srcs.slice(1); // import.ts downloads coverUrl separately from images
  return {
    coverUrl,
    images: galleryImages.join("|"),
  };
}

async function fetchAllProductsJson(pageSize: number, maxProducts: number) {
  let page = 1;
  const all: ProductsJsonItem[] = [];

  for (;;) {
    if (maxProducts > 0 && all.length >= maxProducts) break;

    const url = `${COLLECTION_URL.replace(/\/$/, "")}/products.json?limit=${pageSize}&page=${page}`;
    console.log(`Fetching products.json page=${page}: ${url}`);

    const data = await fetchJson<{ products: ProductsJsonItem[] }>(url);
    const products = data.products ?? [];

    if (products.length === 0) break;

    all.push(...products);

    if (products.length < pageSize) break;
    page++;
  }

  if (maxProducts > 0) return all.slice(0, maxProducts);
  return all;
}

async function main() {
  const outPath =
    process.argv[2] ?? join(process.cwd(), "output", "mack-new-books.csv");
  const pageSize = Number(process.argv[3] ?? 250);
  const maxProducts = Number(process.argv[4] ?? 0);
  const skipDbCheck = process.argv.includes("--skip-db-check");

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

  console.log("Fetching collection products from products.json...");
  const products = await fetchAllProductsJson(pageSize, maxProducts);

  console.log(`Total products to scrape: ${products.length}`);

  const lines: string[] = [rowToCsv(header)];

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const productUrl = `${BASE}/products/${p.handle}`;

    console.log(`[${i + 1}/${products.length}] ${p.handle}`);

    try {
      const html = await fetchHtml(productUrl);
      const { title, artist, description } = parseTitleArtistDescription(html);

      // Fallbacks just in case selectors move.
      const safeTitle = title || p.handle;
      const safeArtist = artist || "";

      const availability = jsonToAvailability(p);
      const { coverUrl, images } = jsonToCoverAndImages(p);

      const artistExists = skipDbCheck
        ? false
        : await artistExistsInDb(safeArtist);

      lines.push(
        rowToCsv({
          title: safeTitle,
          artist: safeArtist,
          artistExistsInDb: artistExists,
          description,
          coverUrl,
          images,
          availability,
          purchaseLink: productUrl,
        }),
      );

      // Small delay to be polite.
      await new Promise((r) => setTimeout(r, 150));
    } catch (err) {
      console.error(`Error scraping ${p.handle}:`, err);
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
