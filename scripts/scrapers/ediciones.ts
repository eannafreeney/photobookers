/**
 * Ediciones Posibles scraper (Wix)
 *
 * Site: https://www.edicionesposibles.com
 * Product pages: /product-page/<slug>
 *
 * Field mapping:
 * - title: h1 (prefers [data-hook="product-title"])
 * - artist: "" (empty string per requirement)
 * - description: [data-hook="description"]
 *
 * Run:
 *   npx tsx scripts/scrapers/ediciones-posibles.ts [output-path] [maxProducts]
 *
 * Example:
 *   npx tsx scripts/scrapers/ediciones-posibles.ts output/ediciones-posibles.csv 0
 */

import "../env";

import * as cheerio from "cheerio";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import {
  artistExistsInDb,
  fetchHtml,
  normalizeUrl,
  rowToCsv,
} from "../scraperUtils";

const BASE = "https://www.edicionesposibles.com";
const START_URL = BASE;

function cleanText(s: string): string {
  return (s ?? "").replace(/\s+/g, " ").trim();
}

function getProductUrlsFromHtml(html: string): string[] {
  const $ = cheerio.load(html);
  const urls = new Set<string>();

  $('a[href*="/product-page/"]').each((_, el) => {
    const href = cleanText($(el).attr("href") ?? "");
    if (!href) return;
    const full = normalizeUrl(href, BASE);
    if (full.includes("/product-page/")) urls.add(full);
  });

  return [...urls];
}

async function collectProductUrls(maxProducts: number): Promise<string[]> {
  const homepage = await fetchHtml(START_URL);
  const homepageUrls = getProductUrlsFromHtml(homepage);

  const all = new Set<string>(homepageUrls);

  // Wix pages may not render all store links on the root page.
  const fallbackPaths = ["/shop", "/store", "/store-page", "/books"];
  for (const p of fallbackPaths) {
    if (maxProducts > 0 && all.size >= maxProducts) break;
    const url = `${BASE}${p}`;
    try {
      const html = await fetchHtml(url);
      for (const productUrl of getProductUrlsFromHtml(html)) {
        all.add(productUrl);
      }
    } catch {
      // Some fallback paths may not exist on this site.
    }
  }

  const urls = [...all];
  if (maxProducts > 0) return urls.slice(0, maxProducts);
  return urls;
}

function parseProductPage(html: string): {
  title: string;
  artist: string;
  description: string;
  coverUrl: string;
  images: string;
  availability: string;
  purchaseLink: string;
} {
  const $ = cheerio.load(html);

  const title =
    cleanText($('h1[data-hook="product-title"]').first().text()) ||
    cleanText($("h1").first().text());

  const artist = "";

  const description = cleanText(
    $('[data-hook="description"]').first().text() ||
      $('[data-hook="description"] pre').first().text(),
  );

  const canonical = cleanText($('link[rel="canonical"]').attr("href") ?? "");
  const ogImage = cleanText($('meta[property="og:image"]').attr("content") ?? "");

  const rawImageUrls = new Set<string>();
  if (ogImage) rawImageUrls.add(normalizeUrl(ogImage, BASE));
  $('img[src*="wixstatic.com"], img[data-src*="wixstatic.com"]').each((_, el) => {
    const src = $(el).attr("src") ?? $(el).attr("data-src") ?? "";
    const normalized = cleanText(src);
    if (normalized) rawImageUrls.add(normalizeUrl(normalized, BASE));
  });

  const imageUrls = [...rawImageUrls];
  const coverUrl = imageUrls[0] ?? "";
  const images = imageUrls.slice(1).join("|");

  return {
    title,
    artist,
    description,
    coverUrl,
    images,
    availability: "available",
    purchaseLink: canonical,
  };
}

async function main() {
  const outPath =
    process.argv[2] ?? join(process.cwd(), "output", "ediciones-posibles.csv");
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
  const lines: string[] = [rowToCsv(header)];

  console.log("Discovering Ediciones Posibles product URLs...");
  const productUrls = await collectProductUrls(maxProducts);
  console.log(`Found ${productUrls.length} product URLs.`);

  for (let i = 0; i < productUrls.length; i++) {
    const url = productUrls[i];
    console.log(`[${i + 1}/${productUrls.length}] ${url}`);
    try {
      const html = await fetchHtml(url);
      const parsed = parseProductPage(html);
      const title = parsed.title || cleanText(url.split("/").pop() ?? "");
      const purchaseLink = parsed.purchaseLink || url;
      const artistExists = skipDbCheck
        ? false
        : await artistExistsInDb(parsed.artist);

      lines.push(
        rowToCsv({
          title,
          artist: parsed.artist,
          artistExistsInDb: artistExists,
          description: parsed.description,
          coverUrl: parsed.coverUrl,
          images: parsed.images,
          availability: parsed.availability,
          purchaseLink,
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
