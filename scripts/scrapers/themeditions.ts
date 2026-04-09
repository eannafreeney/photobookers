/**
 * the(M) editions scraper (Squarespace)
 *
 * Site: https://themeditions.com
 * Product pages: /catalogue/<slug>
 *
 * Field mapping:
 * - title: h1.ProductItem-details-title
 * - artist: first p inside .ProductItem-details-excerpt
 * - description: all p tags inside .ProductItem-details-excerpt
 *
 * Run:
 *   npx tsx scripts/scrapers/themeditions.ts [output-path] [maxProducts]
 *
 * Example:
 *   npx tsx scripts/scrapers/themeditions.ts output/themeditions.csv 0
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

const BASE = "https://themeditions.com";
const CATALOGUE_URL = `${BASE}/catalogue`;
const CATALOGUE_JSON_URL = `${BASE}/catalogue?format=json`;

function cleanText(s: string): string {
  return decodeHtmlEntities((s ?? "").replace(/\s+/g, " ").trim());
}

type CatalogueJsonItem = {
  fullUrl?: string;
  title?: string;
};

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { "User-Agent": "PhotobookersScraper/1.0" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return (await res.json()) as T;
}

async function collectProductUrls(maxProducts: number): Promise<string[]> {
  const urls: string[] = [];
  const seen = new Set<string>();

  try {
    const data = await fetchJson<{ items?: CatalogueJsonItem[] }>(CATALOGUE_JSON_URL);
    for (const item of data.items ?? []) {
      const fullUrl = cleanText(item.fullUrl ?? "");
      if (!fullUrl) continue;
      const url = normalizeUrl(fullUrl.split("?")[0], BASE);
      if (!url.includes("/catalogue/")) continue;
      if (!seen.has(url)) {
        seen.add(url);
        urls.push(url);
      }
      if (maxProducts > 0 && urls.length >= maxProducts) break;
    }
  } catch {
    // Fallback to parsing links directly from catalogue HTML.
    const html = await fetchHtml(CATALOGUE_URL);
    const $ = cheerio.load(html);
    $('a[href*="/catalogue/"]').each((_, el) => {
      const href = cleanText($(el).attr("href") ?? "");
      if (!href) return;
      const url = normalizeUrl(href.split("?")[0], BASE);
      const path = new URL(url).pathname;
      const segs = path.split("/").filter(Boolean);
      if (segs.length !== 2 || segs[0] !== "catalogue") return;
      if (!seen.has(url)) {
        seen.add(url);
        urls.push(url);
      }
    });
  }

  if (maxProducts > 0) return urls.slice(0, maxProducts);
  return urls;
}

async function scrapeProduct(productUrl: string): Promise<{
  title: string;
  artist: string;
  artistExistsInDb: boolean;
  description: string;
  coverUrl: string;
  images: string;
  availability: "available" | "sold_out";
  purchaseLink: string;
}> {
  const html = await fetchHtml(productUrl);
  const $ = cheerio.load(html);

  const title =
    cleanText($("h1.ProductItem-details-title").first().text()) ||
    cleanText($("h1").first().text()) ||
    cleanText($('meta[property="og:title"]').attr("content") ?? "").replace(
      /\s+[—-]\s+the\(M\)\s+editions$/i,
      "",
    );

  const paragraphs = $(".ProductItem-details-excerpt p")
    .toArray()
    .map((p) => cleanText($(p).text()))
    .filter(Boolean);

  const artist = paragraphs[0] ?? "";
  const description = paragraphs.join("\n\n");

  const imageUrls: string[] = [];
  $(".ProductItem-gallery-slides-item-image").each((_, el) => {
    const src =
      $(el).attr("data-image") || $(el).attr("data-src") || $(el).attr("src") || "";
    const full = cleanText(src);
    if (!full) return;
    const normalized = normalizeUrl(full, BASE);
    if (!imageUrls.includes(normalized)) imageUrls.push(normalized);
  });

  if (imageUrls.length === 0) {
    const ogImage = cleanText($('meta[property="og:image"]').attr("content") ?? "");
    if (ogImage) imageUrls.push(normalizeUrl(ogImage, BASE));
  }

  const soldOut = $(".product-mark.sold-out").length > 0;
  const availability: "available" | "sold_out" = soldOut ? "sold_out" : "available";

  const coverUrl = imageUrls[0] ?? "";
  const images = imageUrls.slice(1).join("|");
  const canonical = cleanText($('link[rel="canonical"]').attr("href") ?? "");
  const purchaseLink = canonical || productUrl;
  const artistInDb = await artistExistsInDb(artist);

  return {
    title,
    artist,
    artistExistsInDb: artistInDb,
    description,
    coverUrl,
    images,
    availability,
    purchaseLink,
  };
}

async function main() {
  const outPath = process.argv[2] ?? join(process.cwd(), "output", "themeditions.csv");
  const maxProducts = Number(process.argv[3] ?? 0);
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

  console.log("Fetching the(M) editions catalogue...");
  const productUrls = await collectProductUrls(maxProducts);
  console.log(`Found ${productUrls.length} product URLs.`);

  const lines: string[] = [rowToCsv(header)];
  for (let i = 0; i < productUrls.length; i++) {
    const url = productUrls[i];
    console.log(`[${i + 1}/${productUrls.length}] ${url}`);
    try {
      const row = await scrapeProduct(url);
      lines.push(
        rowToCsv({
          ...row,
          artistExistsInDb: skipDbCheck ? false : row.artistExistsInDb,
        }),
      );
      await new Promise((r) => setTimeout(r, 150));
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
