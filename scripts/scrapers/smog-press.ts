/**
 * Smog Press books scraper
 * Site: https://smog-press.xyz/collections/frontpage
 *
 * Uses the Shopify storefront JSON API to avoid Cloudflare HTML blocking.
 * API: /collections/frontpage/products.json?limit=250&page=N
 *
 * Field mapping:
 * - title:       product.title
 * - artist:      product.vendor
 * - description: product.body_html (HTML → plain text)
 *
 * CSV output columns:
 *   - title
 *   - artist
 *   - artistExistsInDb
 *   - description
 *   - coverUrl
 *   - images (gallery URLs separated by "|", excluding coverUrl)
 *   - availability ("sold out" | "available")
 *   - purchaseLink
 *
 * Run:
 *   npx tsx scripts/scrapers/smog-press.ts [output-path] [amount]
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

const BASE = "https://smog-press.xyz";
const COLLECTION_HANDLE = "frontpage";
const API_URL = `${BASE}/collections/${COLLECTION_HANDLE}/products.json`;

type ShopifyImage = {
  src: string;
};

type ShopifyVariant = {
  available: boolean;
};

type ShopifyProduct = {
  id: number;
  title: string;
  handle: string;
  body_html: string;
  vendor: string;
  variants: ShopifyVariant[];
  images: ShopifyImage[];
};

type ShopifyProductsResponse = {
  products: ShopifyProduct[];
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

function htmlToPlainText(html: string): string {
  const $ = cheerio.load(html);
  $("script, style").remove();

  const paragraphs = $("p, br")
    .toArray()
    .map((el) => {
      if (el.type === "tag" && el.name === "br") return "";
      return cleanWhitespace(decodeHtmlEntities($(el).text()));
    })
    .filter(Boolean);

  if (paragraphs.length > 0) {
    return paragraphs.join("\n\n");
  }

  return cleanWhitespace(decodeHtmlEntities($.text()));
}

async function fetchProducts(page: number): Promise<ShopifyProduct[]> {
  const url = `${API_URL}?limit=250&page=${page}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
      Accept: "application/json",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  const data = (await res.json()) as ShopifyProductsResponse;
  return data.products ?? [];
}

async function processProduct(product: ShopifyProduct): Promise<{
  title: string;
  artist: string;
  artistExistsInDb: boolean;
  description: string;
  coverUrl: string;
  images: string;
  availability: string;
  purchaseLink: string;
}> {
  const title = cleanWhitespace(product.title);
  const artist = cleanWhitespace(product.vendor);

  const description = htmlToPlainText(product.body_html ?? "");

  const imageUrls = uniqPreserveOrder(
    product.images.map((img) => {
      const src = img.src ?? "";
      return src.startsWith("//") ? `https:${src}` : src;
    }),
  );
  const coverUrl = imageUrls[0] ?? "";
  const images = imageUrls.slice(1).join("|");

  const available = product.variants.some((v) => v.available);
  const availability = available ? "available" : "sold out";

  const purchaseLink = `${BASE}/products/${product.handle}`;

  const artistExists = artist ? await artistExistsInDb(artist) : false;

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
  const outPath =
    process.argv[2] ?? join(process.cwd(), "output", "smog-press.csv");
  const amountArg = process.argv[3];
  const amount = amountArg ? Math.max(0, Number(amountArg)) : Infinity;

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
      const row = await processProduct(product);
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
