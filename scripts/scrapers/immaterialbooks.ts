/**
 * Immaterial Books scraper (Squarespace)
 * Site: https://www.immaterialbooks.com/
 *
 * Listing: /store?format=json
 * Titles are "Book Title, Artist" (last comma).
 *
 * Run:
 *   npx tsx scripts/scrapers/immaterialbooks.ts [output-path] [amount]
 *   npx tsx scripts/scrapers/immaterialbooks.ts output/immaterialbooks.csv 0 --skip-db-check
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

const BASE = "https://www.immaterialbooks.com";
const LISTING_JSON_URL = `${BASE}/store?format=json`;

type StoreVariant = {
  unlimited?: boolean;
  qtyInStock?: number;
};

type StoreImage = {
  assetUrl?: string;
  recordTypeLabel?: string;
  contentType?: string;
};

type StoreItem = {
  title?: string;
  excerpt?: string;
  fullUrl?: string;
  assetUrl?: string;
  items?: StoreImage[];
  variants?: StoreVariant[];
  structuredContent?: { variants?: StoreVariant[] };
};

function cleanWhitespace(s: string): string {
  return decodeHtmlEntities((s ?? "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim());
}

function uniqPreserveOrder(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of values) {
    if (!v || seen.has(v)) continue;
    seen.add(v);
    out.push(v);
  }
  return out;
}

function htmlToPlainText(html: string): string {
  const $ = cheerio.load(html ?? "");
  $("script, style, meta").remove();
  $("br").replaceWith("\n");
  $("p, div, h1, h2, h3, li").each((_, el) => {
    $(el).append("\n");
  });
  return decodeHtmlEntities($.root().text())
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const ARTIST_SUFFIX =
  /\s*(\((?:eBook|ebook|\d+(?:st|nd|rd|th)\s+Edition)\))\s*$/i;

/** "Title, Artist" — last comma. Edition/eBook suffixes stay on the title. */
function splitTitleArtist(raw: string): { title: string; artist: string } {
  const cleaned = cleanWhitespace(raw);
  if (!cleaned) return { title: "", artist: "" };

  const lastComma = cleaned.lastIndexOf(", ");
  if (lastComma === -1) return { title: cleaned, artist: "" };

  let title = cleaned.slice(0, lastComma).trim();
  let artist = cleaned.slice(lastComma + 2).trim();

  const suffix = artist.match(ARTIST_SUFFIX);
  if (suffix) {
    artist = artist.slice(0, -suffix[0].length).trim();
    if (suffix[1] && !title.includes(suffix[1])) {
      title = `${title} ${suffix[1]}`;
    }
  }

  return { title, artist };
}

function variantsOf(item: StoreItem): StoreVariant[] {
  return item.structuredContent?.variants ?? item.variants ?? [];
}

function availabilityOf(item: StoreItem): "available" | "sold out" {
  const variants = variantsOf(item);
  if (variants.length === 0) return "available";
  const inStock = variants.some(
    (v) => v.unlimited === true || (v.qtyInStock ?? 0) > 0,
  );
  return inStock ? "available" : "sold out";
}

function imageUrlsOf(item: StoreItem): string[] {
  const nested = (item.items ?? [])
    .filter(
      (img) =>
        (img.recordTypeLabel === "image" ||
          (img.contentType ?? "").startsWith("image/")) &&
        img.assetUrl,
    )
    .map((img) => img.assetUrl as string);
  const urls = uniqPreserveOrder(nested);
  if (urls.length === 0 && item.assetUrl) urls.push(item.assetUrl);
  return urls;
}

async function fetchStoreItems(): Promise<StoreItem[]> {
  const res = await fetch(LISTING_JSON_URL, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
      Accept: "application/json",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${LISTING_JSON_URL}`);
  const data = (await res.json()) as { items?: StoreItem[] };
  return data.items ?? [];
}

async function processItem(
  item: StoreItem,
  skipDbCheck: boolean,
): Promise<Record<string, string | boolean>> {
  const { title, artist } = splitTitleArtist(item.title ?? "");
  const description = htmlToPlainText(item.excerpt ?? "");
  const images = imageUrlsOf(item);
  const purchasePath = (item.fullUrl ?? "").split("?")[0];
  const purchaseLink = purchasePath
    ? `${BASE}${purchasePath.startsWith("/") ? "" : "/"}${purchasePath}`
    : "";

  const artistExists =
    skipDbCheck || !artist ? false : await artistExistsInDb(artist);

  return {
    title,
    artist,
    artistExistsInDb: artistExists,
    description,
    coverUrl: images[0] ?? "",
    images: images.slice(1).join("|"),
    availability: availabilityOf(item),
    purchaseLink,
  };
}

async function main() {
  const positional = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  const outPath =
    positional[0] ?? join(process.cwd(), "output", "immaterialbooks.csv");
  const amountArg = positional[1];
  const amount = amountArg ? Math.max(0, Number(amountArg)) : Infinity;
  const skipDbCheck = process.argv.includes("--skip-db-check");

  console.log(`Fetching listing: ${LISTING_JSON_URL}`);
  const allItems = await fetchStoreItems();
  const items =
    amount === Infinity || amount === 0 ? allItems : allItems.slice(0, amount);

  console.log(`Found ${allItems.length} products. Scraping ${items.length}...`);

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

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    console.log(`[${i + 1}/${items.length}] ${item.title}`);
    try {
      lines.push(rowToCsv(await processItem(item, skipDbCheck)));
    } catch (err) {
      console.error(`Error processing "${item.title}":`, err);
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
