/**
 * The Velvet Cell scraper
 * Fetches book data from https://thevelvetcell.com/shop/* product pages
 * and writes CSV with: title, artist, artistExistsInDb, description, specs,
 * coverUrl, images, availability, purchaseLink
 *
 * Run: npx tsx scripts/scrapers/scrape-thevelvetcell.ts [output-path]
 *
 * Product URLs: pass as list or implement getProductUrls() (e.g. fetch /shop or /catalogue).
 */

import * as cheerio from "cheerio";
import { ilike } from "drizzle-orm";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { db } from "../../src/db/client";
import { creators } from "../../src/db/schema";

const BASE = "https://thevelvetcell.com";
const COLLECTION_URL = `${BASE}/catalogue`;

function escapeCsv(value: string): string {
  const s = String(value ?? "");
  if (
    s.includes('"') ||
    s.includes(",") ||
    s.includes("\n") ||
    s.includes("\r")
  ) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function rowToCsv(row: Record<string, string | boolean>): string {
  return Object.values(row)
    .map((v) => escapeCsv(String(v)))
    .join(",");
}

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": "PhotobookersScraper/1.0" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.text();
}

function normalizeUrl(url: string): string {
  if (url.startsWith("//")) return `https:${url}`;
  if (url.startsWith("/")) return `${BASE}${url}`;
  return url;
}

async function artistExistsInDb(artistName: string): Promise<boolean> {
  const trimmed = artistName.trim();
  if (!trimmed) return false;
  const rows = await db
    .select({ id: creators.id })
    .from(creators)
    .where(ilike(creators.displayName, trimmed))
    .limit(1);
  return rows.length > 0;
}

async function getProductUrls(collectionHtml: string): Promise<string[]> {
  const $ = cheerio.load(collectionHtml);
  const urls: string[] = [];
  $('a[href*="/shop/"]').each((_, el) => {
    const href = $(el).attr("href");
    if (href) {
      const full = normalizeUrl(href);
      if (!urls.includes(full)) urls.push(full);
    }
  });
  return urls;
}

async function scrapeProduct(productUrl: string): Promise<{
  title: string;
  artist: string;
  artistExistsInDb: boolean;
  description: string;
  specs: string;
  coverUrl: string;
  images: string;
  availability: string;
  purchaseLink: string;
}> {
  const html = await fetchHtml(productUrl);
  const $ = cheerio.load(html);

  const title =
    $("h3.product__title").first().text().trim() ||
    $('meta[property="og:title"]')
      .attr("content")
      ?.replace(/\s*—\s*The Velvet\s*Cell\s*$/i, "")
      .trim() ||
    "";

  const artist =
    $("#preview h3.product__title").first().next("h4").text().trim() ||
    $("#preview h3.product__title")
      .first()
      .parent()
      .find("h4")
      .first()
      .text()
      .trim() ||
    $("#preview h4").first().text().trim() ||
    "";

  const description =
    $('meta[name="description"]').attr("content")?.trim() ||
    $(".content__item--text .block__text.text p")
      .map((_, el) => $(el).text().trim())
      .get()
      .join("\n\n")
      .trim() ||
    "";

  const specsParts: string[] = [];
  $("#details .grid--details.product--details li").each((_, el) => {
    const label = $(el).find("h3").text().trim();
    const value = $(el).clone().children("h3").remove().end().text().trim();
    if (label && value) specsParts.push(`${label}: ${value}`);
  });
  const specs = specsParts.join("; ");

  // One URL per carousel slide (e.g. first srcset entry or img src)
  const imageUrls: string[] = [];
  $(".carousel__slide .picture").each((_, pictureEl) => {
    const $pic = $(pictureEl);
    const src = $pic.find("img").attr("src");
    if (src && !src.startsWith("data:")) {
      imageUrls.push(normalizeUrl(src));
      return;
    }
    const firstSource = $pic.find("source[srcset]").first();
    const srcset = firstSource.attr("srcset");
    if (srcset) {
      const firstUrl = srcset.split(",")[0]?.trim().split(/\s+/)[0];
      if (firstUrl) imageUrls.push(normalizeUrl(firstUrl));
    }
  });
  const uniqueImages = [...new Set(imageUrls)];
  const coverUrl = uniqueImages[0] ?? "";
  const images = uniqueImages.slice(1).join("|");

  const purchaseLink =
    $('link[rel="canonical"]').attr("href")?.trim() || productUrl;

  const artistExists = await artistExistsInDb(artist);

  return {
    title,
    artist,
    artistExistsInDb: artistExists,
    description,
    specs,
    coverUrl,
    images,
    availability: "available",
    purchaseLink: purchaseLink.startsWith("http")
      ? purchaseLink
      : normalizeUrl(purchaseLink),
  };
}

async function main() {
  const outPath =
    process.argv[2] ?? join(process.cwd(), "output", "thevelvetcell-books.csv");

  console.log("Fetching product list...");
  const collectionHtml = await fetchHtml(COLLECTION_URL);
  const productUrls = (await getProductUrls(collectionHtml)).slice(0, 10);
  console.log(`Found ${productUrls.length} product URLs. Sliced to 10.`);

  const header: Record<string, string> = {
    title: "title",
    artist: "artist",
    artistExistsInDb: "artistExistsInDb",
    description: "description",
    specs: "specs",
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
      lines.push(rowToCsv({ ...row, artistExistsInDb: row.artistExistsInDb }));
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
