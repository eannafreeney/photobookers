/**
 * TRESPASSER scraper
 * https://trespasser.co/
 * Homepage lists publications; product pages at /shop/{slug}
 *
 * Run: npx tsx scripts/scrapers/trespasser.ts [output-path]
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

const BASE = "https://trespasser.co";

function getProductUrlsFromHtml(html: string): string[] {
  const $ = cheerio.load(html);
  const seen = new Set<string>();
  const urls: string[] = [];

  $('a[href*="/shop/"]').each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    const pathOnly = href.split("?")[0].trim();
    if (!pathOnly || pathOnly === "/shop" || pathOnly === "/shop/") return;
    const full = normalizeUrl(pathOnly, BASE);
    if (!seen.has(full)) {
      seen.add(full);
      urls.push(full);
    }
  });

  return urls;
}

async function getAllProductUrls(): Promise<string[]> {
  console.log("Fetching homepage...");
  const html = await fetchHtml(BASE + "/");
  return getProductUrlsFromHtml(html);
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

  const title =
    $("h1").first().text().trim() ||
    $('meta[property="og:title"]')
      .attr("content")
      ?.replace(/\s*[—–-]\s*TRESPASSER\s*$/i, "")
      .trim() ||
    "";

  let artist = "";
  const $links = $(
    'a[href*="bryanschutmaat"], a[href*="schutmaat"], [class*="artist"], [class*="author"]',
  );
  if ($links.length) {
    artist = $links.first().text().trim();
  }
  if (!artist) {
    const byMatch = $.root()
      .text()
      .match(/\bby\s+([A-Za-z][A-Za-z\s]+?)(?:\s+·|\s*\.|$|\n)/);
    if (byMatch) artist = byMatch[1].trim();
  }

  let description = "";
  const $desc =
    $(
      "[class*='description'], .product__description, .product-description, [class*='product'] p",
    )
      .first()
      .closest("div, section, article") || $("main p").first().closest("div");
  if ($desc.length) {
    let descHtml = $desc
      .find("p")
      .toArray()
      .map((el) => $(el).html() ?? "")
      .join("\n");
    if (!descHtml) descHtml = $desc.html() ?? "";
    description = decodeHtmlEntities(descHtml)
      .replace(/<\/p>\s*/gi, "\n")
      .replace(/<p[^>]*>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/^\s+|\s+$/g, "")
      .trim();
  }
  if (!description && $('meta[property="og:description"]').length) {
    description = $('meta[property="og:description"]').attr("content") ?? "";
  }

  const imageUrls: string[] = [];
  $("img").each((_, el) => {
    const src = $(el).attr("data-src") ?? $(el).attr("src");
    if (src && !src.startsWith("data:") && !imageUrls.includes(src)) {
      imageUrls.push(normalizeUrl(src, BASE));
    }
  });
  const ogImage = $('meta[property="og:image"]').attr("content");
  if (ogImage && !imageUrls.includes(ogImage)) {
    imageUrls.unshift(normalizeUrl(ogImage, BASE));
  }
  const uniqueImages = [...new Set(imageUrls)];
  const coverUrl = uniqueImages[0] ?? "";
  const images = uniqueImages.slice(1).join("|");

  const bodyText = $.root().text().toLowerCase();
  const availability = bodyText.includes("sold out") ? "sold out" : "available";

  const artistExists = artist ? await artistExistsInDb(artist) : false;

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
    process.argv[2] ?? join(process.cwd(), "output", "trespasser.csv");

  console.log("Fetching product URLs from homepage...");
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
