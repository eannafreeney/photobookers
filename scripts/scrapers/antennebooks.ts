/**
 * Antenne Books scraper (Photography collection)
 * https://antennebooks.com/collections/books?filter.p.m.custom.categories=Photography
 *
 * - Listing: paginated collection HTML (Shopify storefront)
 * - Product data: /products/{handle}.json
 * - Artist: filter.p.m.custom.author link on product HTML
 *
 * Skips products whose purchase link already exists in the database.
 *
 * Run:
 *   npx tsx scripts/scrapers/antennebooks.ts [output-path]
 */
import "../env";

import * as cheerio from "cheerio";
import { ilike } from "drizzle-orm";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { db } from "../../src/db/client";
import { books } from "../../src/db/schema";
import {
  artistExistsInDb,
  decodeHtmlEntities,
  rowToCsv,
} from "../scraperUtils";

const BASE = "https://antennebooks.com";
const COLLECTION_URL = `${BASE}/collections/books?filter.p.m.custom.categories=Photography`;
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36";
const COLLECTION_DELAY_MS = 2000;
const PRODUCT_DELAY_MS = 1200;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchWithRetry(
  url: string,
  init?: RequestInit,
  retries = 8,
): Promise<Response> {
  const headers = {
    "User-Agent": USER_AGENT,
    Accept: "text/html,application/xhtml+xml,application/json,*/*;q=0.8",
    ...init?.headers,
  };

  for (let attempt = 0; attempt < retries; attempt++) {
    const res = await fetch(url, { ...init, headers });
    if (res.status === 429) {
      const wait = 5000 * (attempt + 1);
      console.warn(`Rate limited on ${url}, waiting ${wait}ms...`);
      await sleep(wait);
      continue;
    }
    return res;
  }
  throw new Error(`HTTP 429 after retries: ${url}`);
}

async function fetchText(url: string, init?: RequestInit): Promise<string> {
  const res = await fetchWithRetry(url, init);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.text();
}

type ShopifyImage = { src: string };
type ShopifyVariant = { available?: boolean };
type ShopifyProduct = {
  title: string;
  handle: string;
  body_html: string;
  images: ShopifyImage[];
  variants: ShopifyVariant[];
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

function getHandlesFromCollectionHtml(html: string): string[] {
  const handles: string[] = [];
  const seen = new Set<string>();

  for (const match of html.matchAll(/data-handle="([^"]+)"/g)) {
    const handle = match[1]?.trim();
    if (!handle || seen.has(handle)) continue;
    seen.add(handle);
    handles.push(handle);
  }

  return handles;
}

async function getAllHandles(): Promise<string[]> {
  const seen = new Set<string>();
  const all: string[] = [];

  for (let page = 1; ; page++) {
    const url = page === 1 ? COLLECTION_URL : `${COLLECTION_URL}&page=${page}`;
    console.log(`Fetching collection page ${page}...`);
    const html = await fetchText(url);
    await sleep(COLLECTION_DELAY_MS);
    const handles = getHandlesFromCollectionHtml(html);
    if (handles.length === 0) break;

    let added = 0;
    for (const handle of handles) {
      if (seen.has(handle)) continue;
      seen.add(handle);
      all.push(handle);
      added++;
    }

    if (added === 0) break;
  }

  return all;
}

async function loadExistingHandles(): Promise<Set<string>> {
  const rows = await db
    .select({ purchaseLink: books.purchaseLink })
    .from(books)
    .where(ilike(books.purchaseLink, "%antennebooks.com%"));

  const handles = new Set<string>();
  for (const row of rows) {
    const link = row.purchaseLink ?? "";
    const match = link.match(/\/products\/([^/?#]+)/);
    if (match?.[1]) handles.add(match[1]);
  }
  return handles;
}

function htmlToPlainText(html: string): string {
  const $ = cheerio.load(html);
  $("script, style").remove();

  const paragraphs = $("p")
    .toArray()
    .map((p) => cleanWhitespace(decodeHtmlEntities($(p).text())))
    .filter(Boolean);

  if (paragraphs.length > 0) return paragraphs.join("\n\n");
  return cleanWhitespace(decodeHtmlEntities($.text()));
}

function extractArtistFromHtml(html: string): string {
  const match = html.match(/filter\.p\.m\.custom\.author=([^"&]+)/);
  if (!match?.[1]) return "";
  return cleanWhitespace(decodeURIComponent(match[1].replace(/\+/g, " ")));
}

async function fetchProductJson(handle: string): Promise<ShopifyProduct | null> {
  const url = `${BASE}/products/${handle}.json`;
  const res = await fetchWithRetry(url, { Accept: "application/json" });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  const data = (await res.json()) as { product?: ShopifyProduct };
  return data.product ?? null;
}

async function scrapeProduct(handle: string): Promise<{
  title: string;
  artist: string;
  artistExistsInDb: boolean;
  description: string;
  coverUrl: string;
  images: string;
  availability: string;
  purchaseLink: string;
} | null> {
  const product = await fetchProductJson(handle);
  const html = await fetchText(`${BASE}/products/${handle}`);
  await sleep(PRODUCT_DELAY_MS);

  if (!product) return null;

  const title = cleanWhitespace(product.title);
  const artist = extractArtistFromHtml(html);
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
  const purchaseLink = `${BASE}/products/${handle}`;

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
    process.argv[2] ?? join(process.cwd(), "output", "antennebooks-photography.csv");

  console.log("Loading existing Antenne Books from database...");
  const existingHandles = await loadExistingHandles();
  console.log(`Found ${existingHandles.size} existing Antenne product(s) in DB.`);

  const handles = await getAllHandles();
  console.log(`Found ${handles.length} products in Photography collection.`);

  const newHandles = handles.filter((h) => !existingHandles.has(h));
  console.log(
    `Skipping ${handles.length - newHandles.length} already in DB. Scraping ${newHandles.length}...`,
  );

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
  let skippedNoArtist = 0;

  for (let i = 0; i < newHandles.length; i++) {
    const handle = newHandles[i];
    const url = `${BASE}/products/${handle}`;
    console.log(`[${i + 1}/${newHandles.length}] ${url}`);

    try {
      const row = await scrapeProduct(handle);
      if (!row) continue;
      if (!row.artist.trim()) {
        skippedNoArtist++;
        console.log(`  Skipping (no artist): ${row.title}`);
        continue;
      }
      lines.push(rowToCsv(row));
    } catch (err) {
      console.error(`Error scraping ${url}:`, err);
    }
  }

  await mkdir(join(outPath, ".."), { recursive: true });
  await writeFile(outPath, lines.join("\n"), "utf8");
  console.log(
    `Wrote ${lines.length - 1} rows to ${outPath} (${skippedNoArtist} skipped with no artist).`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
