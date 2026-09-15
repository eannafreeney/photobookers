/**
 * Rust Publishing scraper (Shopify)
 * Site: https://www.rustpublishing.cc/
 *
 * Uses products.json (HTML theme has no usable h1 / vendor artist).
 *
 * Field mapping:
 * - title:       product.title, with "[SOLD OUT]" stripped
 * - artist:      photography credit or leading "By …" in body_html
 * - description: product.body_html (HTML → plain text)
 *
 * Run:
 *   npx tsx scripts/scrapers/rustpublishing.ts [output-path] [amount]
 *   npx tsx scripts/scrapers/rustpublishing.ts output/rustpublishing.csv 20 --skip-db-check
 */

import "../env";

import * as cheerio from "cheerio";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import {
  artistExistsInDb,
  decodeHtmlEntities,
  rowToCsv,
} from "../scraperUtils";

const BASE = "https://www.rustpublishing.cc";
const API_URL = `${BASE}/products.json`;

type ShopifyImage = { src: string };
type ShopifyVariant = { available: boolean };
type ShopifyProduct = {
  title: string;
  handle: string;
  body_html: string;
  variants: ShopifyVariant[];
  images: ShopifyImage[];
};

function cleanWhitespace(s: string): string {
  return (s ?? "").replace(/\s+/g, " ").trim();
}

function uniqPreserveOrder(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of values) {
    if (!v) continue;
    if (seen.has(v)) continue;
    seen.add(v);
    out.push(v);
  }
  return out;
}

function cleanTitle(title: string): string {
  return cleanWhitespace(title.replace(/\s*\[SOLD OUT\]\s*/gi, " "));
}

function htmlToPlainText(html: string): string {
  const $ = cheerio.load(html ?? "");
  $("script, style, meta").remove();
  $("br").replaceWith("\n");
  $("p, div, h1, h2, h3, li").each((_, el) => {
    $(el).append("\n");
  });
  const text = decodeHtmlEntities($.root().text())
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return text;
}

function cleanArtist(s: string): string {
  return cleanWhitespace(s).replace(/[.,;:]+$/, "");
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Artist from colophon / "By Name." / "Title by Name" — vendor is always the press. */
function extractArtist(description: string, title: string): string {
  const credit = description.match(
    /^(?:Fotografie\s*\/\s*)?(?:Photographs?|Photography(?:\s*&\s*text)?|Photography(?:\s*,\s*design)?)(?:\s*[:\-–]\s*|\s+-\s+)(.+)$/im,
  );
  if (credit) return cleanArtist(credit[1]);

  const photoBy = description.match(
    /Photography(?:\s+and\s+editing)?\s+by\s+([^.\n]+)/i,
  );
  if (photoBy) return cleanArtist(photoBy[1]);

  const byLine = description.match(/^By\s+(.+)$/m);
  if (byLine) return cleanArtist(byLine[1]);

  const titleForMatch = cleanTitle(title);
  if (titleForMatch) {
    const titleBy = description.match(
      new RegExp(
        `^${escapeRegExp(titleForMatch)}\\s+by\\s+(.+)$`,
        "im",
      ),
    );
    if (titleBy) {
      const name = titleBy[1].replace(/\s+is\b[\s\S]*$/i, "");
      return cleanArtist(name);
    }
  }

  return "";
}

async function fetchProducts(page: number): Promise<ShopifyProduct[]> {
  const url = `${API_URL}?limit=250&page=${page}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "PhotobookersScraper/1.0", Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  const data = (await res.json()) as { products?: ShopifyProduct[] };
  return data.products ?? [];
}

async function processProduct(
  product: ShopifyProduct,
  skipDbCheck: boolean,
): Promise<{
  title: string;
  artist: string;
  artistExistsInDb: boolean;
  description: string;
  coverUrl: string;
  images: string;
  availability: string;
  purchaseLink: string;
}> {
  const title = cleanTitle(product.title);
  const description = htmlToPlainText(product.body_html ?? "");
  const artist = extractArtist(description, title);

  const imageUrls = uniqPreserveOrder(
    (product.images ?? []).map((img) => {
      const src = img.src ?? "";
      if (!src) return "";
      return src.startsWith("//") ? `https:${src}` : src;
    }),
  );
  const coverUrl = imageUrls[0] ?? "";
  const images = imageUrls.slice(1).join("|");

  const available = (product.variants ?? []).some((v) => v.available);
  const soldOutInTitle = /\[sold out\]/i.test(product.title);
  const availability =
    available && !soldOutInTitle ? "available" : "sold out";
  const purchaseLink = `${BASE}/products/${product.handle}`;

  const artistExists =
    skipDbCheck || !artist ? false : await artistExistsInDb(artist);

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
  const positional = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  const outPath =
    positional[0] ?? join(process.cwd(), "output", "rustpublishing.csv");
  const amount = positional[1] ? Math.max(0, Number(positional[1])) : Infinity;
  const skipDbCheck = process.argv.includes("--skip-db-check");

  console.log(`Fetching products from: ${API_URL}`);

  const allProducts: ShopifyProduct[] = [];
  for (let page = 1; ; page++) {
    const products = await fetchProducts(page);
    if (products.length === 0) break;
    for (const p of products) {
      allProducts.push(p);
      if (allProducts.length >= amount) break;
    }
    if (allProducts.length >= amount || products.length < 250) break;
  }

  console.log(`Found ${allProducts.length} products. Processing...`);

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

  for (let i = 0; i < allProducts.length; i++) {
    const product = allProducts[i];
    console.log(`[${i + 1}/${allProducts.length}] ${product.title}`);
    try {
      const row = await processProduct(product, skipDbCheck);
      lines.push(rowToCsv(row));
    } catch (err) {
      console.error(`Error processing "${product.title}":`, err);
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
