/**
 * Friend Editions scraper (Shopify)
 *
 * Site: https://friendeditions.com
 * Product pages: /products/<handle>
 *
 * Field mapping:
 * - title: `.product-title` before ":" (fallback: product.title before ":")
 * - artist: `.product-title` after ":" (fallback: product.title after ":")
 * - description: `.p1` (fallback: meta description, then body_html text)
 * - coverUrl/images: from Shopify products.json images
 * - availability: sold out if all variants unavailable, else available
 *
 * Run:
 *   npx tsx scripts/scrapers/friend-editions.ts [output-path] [pageSize] [maxProducts]
 *
 * Example:
 *   npx tsx scripts/scrapers/friend-editions.ts output/friend-editions.csv 250 0
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

const BASE = "https://friendeditions.com";

type ProductImage = { src: string };
type ProductVariant = { available: boolean };
type ProductsJsonItem = {
  handle: string;
  title: string;
  body_html: string;
  images: ProductImage[];
  variants: ProductVariant[];
};

function cleanText(s: string): string {
  return (s ?? "").replace(/\s+/g, " ").trim();
}

function stripShopSuffix(s: string): string {
  return s.replace(/\s*[–-]\s*FRIEND EDITIONS\s*$/i, "").trim();
}

function splitTitleArtist(raw: string): { title: string; artist: string } {
  const text = cleanText(raw);
  if (!text) return { title: "", artist: "" };

  const idx = text.indexOf(":");
  if (idx === -1) return { title: text, artist: "" };

  return {
    title: cleanText(text.slice(0, idx)),
    artist: cleanText(text.slice(idx + 1)),
  };
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { "User-Agent": "PhotobookersScraper/1.0" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return (await res.json()) as T;
}

function bodyHtmlToText(html: string): string {
  const $ = cheerio.load(`<div id="x">${html ?? ""}</div>`);
  return cleanText(decodeHtmlEntities($("#x").text()));
}

function parseProductPage(html: string): {
  title: string;
  artist: string;
  description: string;
  canonical: string;
} {
  const $ = cheerio.load(html);

  const titleNode = cleanText($(".product-title").first().text());
  const ogTitle = cleanText(
    stripShopSuffix($('meta[property="og:title"]').attr("content") ?? ""),
  );
  const h1 = cleanText($("h1").first().text());

  const titleSource = titleNode || ogTitle || h1;
  const { title, artist } = splitTitleArtist(titleSource);

  const description =
    cleanText($(".p1").first().text()) ||
    cleanText($('meta[name="description"]').attr("content") ?? "") ||
    "";

  const canonical =
    cleanText($('link[rel="canonical"]').attr("href") ?? "") || "";

  return { title, artist, description, canonical };
}

function jsonToCoverAndImages(product: ProductsJsonItem): {
  coverUrl: string;
  images: string;
} {
  const srcs = (product.images ?? [])
    .map((img) => img?.src)
    .filter((s): s is string => typeof s === "string" && s.trim().length > 0)
    .map((s) => normalizeUrl(s, BASE));

  const unique: string[] = [];
  const seen = new Set<string>();
  for (const src of srcs) {
    if (!src || seen.has(src)) continue;
    seen.add(src);
    unique.push(src);
  }

  const coverUrl = unique[0] ?? "";
  const images = unique.slice(1).join("|");
  return { coverUrl, images };
}

function jsonToAvailability(product: ProductsJsonItem): "sold_out" | "available" {
  const variants = product.variants ?? [];
  if (variants.length === 0) return "available";
  const allUnavailable = variants.every((v) => v?.available === false);
  return allUnavailable ? "sold_out" : "available";
}

async function fetchAllProductsJson(
  pageSize: number,
  maxProducts: number,
): Promise<ProductsJsonItem[]> {
  let page = 1;
  const all: ProductsJsonItem[] = [];

  for (;;) {
    if (maxProducts > 0 && all.length >= maxProducts) break;

    const url = `${BASE}/products.json?limit=${pageSize}&page=${page}`;
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
    process.argv[2] ?? join(process.cwd(), "output", "friend-editions.csv");
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

  console.log("Fetching Friend Editions products...");
  const products = await fetchAllProductsJson(pageSize, maxProducts);
  console.log(`Total products to scrape: ${products.length}`);

  const lines: string[] = [rowToCsv(header)];

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const productUrl = `${BASE}/products/${p.handle}`;
    console.log(`[${i + 1}/${products.length}] ${productUrl}`);

    try {
      const html = await fetchHtml(productUrl);
      const parsed = parseProductPage(html);

      // Respect selector rules first; fallback to JSON values.
      const fallbackTitleArtist = splitTitleArtist(p.title ?? "");
      const title = parsed.title || fallbackTitleArtist.title || p.handle;
      const artist = parsed.artist || fallbackTitleArtist.artist || "";
      const description = parsed.description || bodyHtmlToText(p.body_html ?? "");

      const { coverUrl, images } = jsonToCoverAndImages(p);
      const availability = jsonToAvailability(p);
      const purchaseLink = parsed.canonical || productUrl;

      const artistExists = skipDbCheck ? false : await artistExistsInDb(artist);

      lines.push(
        rowToCsv({
          title,
          artist,
          artistExistsInDb: artistExists,
          description,
          coverUrl,
          images,
          availability,
          purchaseLink,
        }),
      );

      await new Promise((r) => setTimeout(r, 150));
    } catch (err) {
      console.error(`Error scraping ${productUrl}:`, err);
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
