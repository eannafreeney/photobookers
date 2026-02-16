/**
 * Nazraeli Press scraper
 * Fetches book data from https://www.nazraeli.com/complete-catalogue?category=Regular%20Edition
 * and writes CSV with: title, artist, artistExistsInDb, description, specs, coverUrl, images, availability, purchaseLink
 *
 * Run: npx tsx scripts/scrapers/nazraeli.ts [output-path]
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

const BASE = "https://www.nazraeli.com";
const CATALOGUE_URL = `${BASE}/complete-catalogue?category=Regular%20Edition`;
const AMOUNT_OF_BOOKS = 3;

function titleCase(s: string): string {
  return s
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

async function getAllProductUrls(): Promise<string[]> {
  console.log("Fetching catalogue:", CATALOGUE_URL);
  const html = await fetchHtml(CATALOGUE_URL);
  const $ = cheerio.load(html);
  const allUrls: string[] = [];
  const seen = new Set<string>();

  $('a[href*="/complete-catalogue/"]').each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    const pathOnly = href.split("?")[0];
    const full = normalizeUrl(pathOnly, BASE);
    const path = new URL(full).pathname;
    const segments = path.split("/").filter(Boolean);
    // Product pages are /complete-catalogue/slug (exactly two segments)
    if (segments.length !== 2 || segments[0] !== "complete-catalogue") return;
    if (!seen.has(full)) {
      seen.add(full);
      allUrls.push(full);
    }
  });

  return allUrls;
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

  const rawTitle = $("h1.product-title").first().text().trim() || "";
  const pipeIndex = rawTitle.indexOf(" | ");
  let artist = "";
  let title = rawTitle;
  if (pipeIndex > -1) {
    artist = titleCase(rawTitle.slice(0, pipeIndex));
    title = rawTitle.slice(pipeIndex + 3).trim();
  }

  const excerptEl = $(".product-excerpt").first();
  const paragraphs = excerptEl.find("p").toArray();
  let specs = "";
  const descriptionParts: string[] = [];
  paragraphs.forEach((p, i) => {
    const text = $(p).text().trim().replace(/\s+/g, " ");
    if (i < 2) {
      specs = (specs ? specs + "\n" : "") + text;
    } else {
      descriptionParts.push(text);
    }
  });
  specs = specs
    .replace(/,/g, "\n")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .join("\n");

  const description =
    descriptionParts.join("\n\n").trim() ||
    excerptEl.text().trim().replace(/\s+/g, " ");
  const descriptionClean = description
    .replace(/\s*Click images to enlarge\.?\s*$/i, "")
    .trim();

  const imageUrls: string[] = [];
  $("#productSlideshow .slide img").each((_, el) => {
    const src =
      $(el).attr("data-image") || $(el).attr("data-src") || $(el).attr("src");
    if (src && !src.includes("data:") && !imageUrls.includes(src)) {
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

  const availabilityMeta = $('meta[property="product:availability"]').attr(
    "content",
  );
  const availability =
    availabilityMeta?.toLowerCase() === "instock" ? "available" : "available";

  const artistExists = await artistExistsInDb(artist);

  return {
    title,
    artist,
    artistExistsInDb: artistExists,
    description: descriptionClean,
    specs,
    coverUrl,
    images,
    availability,
    purchaseLink: productUrl,
  };
}

async function main() {
  const outPath =
    process.argv[2] ?? join(process.cwd(), "output", "nazraeli.csv");

  console.log("Fetching catalogue...");
  const productUrls = (await getAllProductUrls()).slice(0, AMOUNT_OF_BOOKS);
  console.log(`Found ${productUrls.length} product URLs.`);

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
