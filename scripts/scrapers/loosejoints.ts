/**
 * Loose Joints Publishing scraper
 * https://loosejoints.biz/
 * Collections: Current Titles, Forthcoming, Signed & Bundles, Special & Rare, Out of Print
 * Product title format: "Artist – Title"
 * Description: .product__description__inner
 *
 * Run: npx tsx scripts/scrapers/loosejoints.ts [output-path]
 */

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

const BASE = "https://loosejoints.biz";

const COLLECTIONS = ["/collections/current-titles"];

function getProductUrlsFromHtml(html: string): string[] {
  const $ = cheerio.load(html);
  const urls: string[] = [];
  $('a[href*="/products/"]').each((_, el) => {
    const href = $(el).attr("href");
    if (href) {
      const full = normalizeUrl(href.split("?")[0], BASE);
      if (!urls.includes(full)) urls.push(full);
    }
  });
  return urls;
}

async function getAllProductUrls(): Promise<string[]> {
  const seen = new Set<string>();
  const all: string[] = [];

  for (const collPath of COLLECTIONS) {
    let page = 1;
    for (;;) {
      const url =
        page === 1 ? `${BASE}${collPath}` : `${BASE}${collPath}?page=${page}`;
      console.log(`Fetching ${collPath} page ${page}...`);
      const html = await fetchHtml(url);
      const urls = getProductUrlsFromHtml(html);
      if (urls.length === 0) break;
      let added = 0;
      for (const u of urls) {
        if (!seen.has(u)) {
          seen.add(u);
          all.push(u);
          added++;
        }
      }
      if (added === 0) break;
      page++;
    }
  }

  return all;
}

async function scrapeProduct(productUrl: string): Promise<{
  title: string;
  artist: string;
  artistExistsInDb: boolean;
  description: string;
  coverUrl: string;
  images: string;
  availability: string;
  purchaseLink: string;
}> {
  const html = await fetchHtml(productUrl);
  const $ = cheerio.load(html);

  const rawTitle =
    $(".product-product-title").first().text().trim() ||
    $('meta[property="og:title"]')
      .attr("content")
      ?.replace(/\s*–\s*Loose Joints Publishing\s*$/i, "")
      .trim() ||
    "";
  const dashIdx = rawTitle.indexOf(" – ");
  const artist = dashIdx >= 0 ? rawTitle.slice(0, dashIdx).trim() : "";
  const title = dashIdx >= 0 ? rawTitle.slice(dashIdx + 3).trim() : rawTitle;

  const descEl = $(".product__description__inner").first();
  const descHtml = descEl.html() ?? "";
  let description = decodeHtmlEntities(descHtml);

  // Block boundaries → newlines (so class="p2" etc. disappear with the tag)
  description = description
    .replace(/<\/p>\s*/gi, "\n")
    .replace(/<\/div>\s*/gi, "\n")
    .replace(/<\/h3>\s*/gi, "\n")
    .replace(/<p[^>]*>/gi, "\n")
    .replace(/<div[^>]*>/gi, "\n")
    .replace(/<h3[^>]*>/gi, "\n");

  // Orphaned class attributes (malformed HTML) → newline
  description = description
    .replace(/\s*class="[^"]*"/g, "\n")
    .replace(/\s*class='[^']*'/g, "\n");

  // Any remaining tags → space
  description = description.replace(/<[^>]+>/g, " ");

  // <br> as newline
  description = description.replace(/<br\s*\/?>/gi, "\n");

  // Collapse whitespace: multiple newlines → max 2, spaces around newlines trimmed
  description = description
    .replace(/[ \t]+/g, " ")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const imageUrls: string[] = [];
  $("img.product-image").each((_, el) => {
    const src = $(el).attr("data-src") || $(el).attr("src");
    if (src && !src.startsWith("data:") && !imageUrls.includes(src)) {
      imageUrls.push(normalizeUrl(src, BASE));
    }
  });
  if (imageUrls.length === 0) {
    const og = $('meta[property="og:image"]').attr("content");
    if (og) imageUrls.push(normalizeUrl(og, BASE));
  }
  const uniqueImages = [...new Set(imageUrls)];
  const coverUrl = uniqueImages[0] ?? "";
  const images = uniqueImages.slice(1).join("|");

  const availabilityMeta = $('meta[property="product:availability"]').attr(
    "content",
  );
  const soldOut =
    $("[data-submit-button-text]").text().toLowerCase().includes("sold out") ||
    availabilityMeta?.toLowerCase() === "oos";
  const availability = soldOut ? "sold out" : "available";

  const artistExists = await artistExistsInDb(artist);

  return {
    title,
    artist,
    artistExistsInDb: artistExists,
    description,
    coverUrl,
    images,
    availability,
    purchaseLink: productUrl,
  };
}

async function main() {
  const outPath =
    process.argv[2] ?? join(process.cwd(), "output", "loosejoints.csv");

  console.log("Fetching product URLs from all collections...");
  const productUrls = await getAllProductUrls();
  console.log(`Found ${productUrls.length} product URLs.`);

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
