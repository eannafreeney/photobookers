/**
 * TRESPASSER scraper
 * https://trespasser.co/
 * Homepage lists publications; product pages at /shop/{slug}
 *
 * HTML structure (Squarespace):
 *   - Title:        h1.product-title
 *   - Artist:       first <p> in .product-excerpt — "by {name}" pattern
 *   - Description:  .product-excerpt paragraphs
 *   - Cover:        #flowThumbnail img[data-src]
 *   - Gallery:      #flowItems article.flow-item img[data-src]
 *   - Availability: meta[property="product:availability"] or "SOLD OUT" in body text
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

function cleanWhitespace(s: string): string {
  return (s ?? "").replace(/\s+/g, " ").trim();
}

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

function extractArtist($: cheerio.CheerioAPI): string {
  // The first paragraph in .product-excerpt typically reads:
  //   "{Title}\nby {Artist Name}"
  // We look for "by " pattern across all text nodes in the excerpt.
  const excerptText = $(".product-excerpt").first().text();
  const byMatch = excerptText.match(/\bby\s+([A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ.\s'-]+?)(?:\s*\n|\s{2,}|$)/m);
  if (byMatch) return cleanWhitespace(byMatch[1]);

  // Fallback: look for a linked artist name in the excerpt
  const $link = $(".product-excerpt a").first();
  if ($link.length) return cleanWhitespace($link.text());

  return "";
}

function extractDescription($: cheerio.CheerioAPI): string {
  const $excerpt = $(".product-excerpt").first();
  if (!$excerpt.length) {
    return cleanWhitespace($('meta[property="og:description"]').attr("content") ?? "");
  }

  // Collect all paragraph text, skip the very short "by {artist}" opener
  const paragraphs = $excerpt
    .find("p")
    .toArray()
    .map((el) => {
      const raw = $(el).html() ?? "";
      return decodeHtmlEntities(raw)
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    })
    .filter(Boolean);

  return paragraphs.join("\n\n").trim();
}

function extractImages($: cheerio.CheerioAPI): string[] {
  const urls: string[] = [];
  const seen = new Set<string>();

  const push = (val: string | undefined | null) => {
    if (!val || val.startsWith("data:")) return;
    const norm = normalizeUrl(val.trim(), BASE);
    if (!seen.has(norm)) {
      seen.add(norm);
      urls.push(norm);
    }
  };

  // 1) Cover image from the main thumbnail panel
  $("#flowThumbnail img").each((_, el) => {
    push($(el).attr("data-src") ?? $(el).attr("src"));
  });

  // 2) Gallery images from the flow items strip
  $("#flowItems article.flow-item img").each((_, el) => {
    push($(el).attr("data-src") ?? $(el).attr("src"));
  });

  // 3) OG image as final fallback
  push($('meta[property="og:image"]').attr("content"));

  return urls;
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
    cleanWhitespace($("h1.product-title").first().text()) ||
    cleanWhitespace($("h1").first().text()) ||
    cleanWhitespace(
      $('meta[property="og:title"]')
        .attr("content")
        ?.replace(/\s*[—–-]\s*TRESPASSER\s*$/i, "") ?? "",
    );

  const artist = extractArtist($);
  const description = extractDescription($);

  const imageUrls = extractImages($);
  const coverUrl = imageUrls[0] ?? "";
  const images = imageUrls.slice(1).join("|");

  // Availability: prefer meta tag, fall back to body text
  const availMeta = $('meta[property="product:availability"]')
    .attr("content")
    ?.toLowerCase();
  const soldOutByMeta = availMeta === "oos" || availMeta === "outofstock";
  const soldOutByText = $.root().text().toLowerCase().includes("sold out");
  const availability = soldOutByMeta || soldOutByText ? "sold out" : "available";

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
