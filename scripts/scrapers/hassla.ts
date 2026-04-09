/**
 * Hassla Books scraper (Cargo site)
 * Site: https://hasslabooks.com/
 * Product pages: /HB###
 *
 * Run:
 *   npx tsx scripts/scrapers/hassla.ts [output-path] [amount]
 *
 * Example:
 *   npx tsx scripts/scrapers/hassla.ts output/hassla.csv 10
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

const BASE = "https://hasslabooks.com";
const DEFAULT_AMOUNT = 10;

function cleanText(s: string): string {
  return decodeHtmlEntities((s ?? "").replace(/\s+/g, " ").trim());
}

function isLikelyProductPath(pathname: string): boolean {
  // Hassla product pages are like /HB097
  return /^\/HB\d{2,}$/i.test(pathname);
}

function getProductUrlsFromHomepage(html: string): string[] {
  const $ = cheerio.load(html);
  const seen = new Set<string>();
  const urls: string[] = [];

  $("a[href]").each((_, el) => {
    const href = ($(el).attr("href") || "").trim();
    if (!href || href.startsWith("#") || href.startsWith("mailto:")) return;

    const withoutQuery = href.split("?")[0];
    const full = normalizeUrl(withoutQuery, BASE);

    let url: URL;
    try {
      url = new URL(full, BASE);
    } catch {
      return;
    }

    if (url.hostname !== new URL(BASE).hostname) return;
    if (!isLikelyProductPath(url.pathname)) return;

    const canonical = `${BASE}${url.pathname}`;
    if (!seen.has(canonical)) {
      seen.add(canonical);
      urls.push(canonical);
    }
  });

  return urls;
}

function parseArtistTitle($: cheerio.CheerioAPI): {
  artist: string;
  title: string;
} {
  // In your sample page content this appears as:
  // Jack Pierson
  // <i>Array (Miami Beach)</i>
  const pageContent = $(".page_content").first();

  const artist = cleanText(
    pageContent
      .contents()
      .filter((_, n) => n.type === "text")
      .first()
      .text(),
  );

  const title = cleanText(pageContent.find("i").first().text());

  // Fallbacks if structure changes
  if (artist && title) return { artist, title };

  const og = cleanText(
    $('meta[property="og:title"]').attr("content") || $("title").first().text(),
  );
  // Sometimes title tags look like "HB097 - Hassla"
  return {
    artist: artist || "",
    title: title || og.replace(/\s*-\s*Hassla.*$/i, "").trim(),
  };
}

function parseDescription($: cheerio.CheerioAPI): string {
  const pageContent = $(".page_content").first().clone();

  // Remove slideshow and cart controls
  pageContent
    .find(".image-gallery, .slideshow-nav, [rel='add_to_cart']")
    .remove();

  const text = cleanText(pageContent.text());

  // Keep descriptive lines from the first metadata block where possible
  // (pages/format/edition/isbn/date/price etc. are all useful for import context)
  return text;
}

function parseImages($: cheerio.CheerioAPI): {
  coverUrl: string;
  images: string;
} {
  const urls: string[] = [];

  // Cargo gallery images
  $(".image-gallery img").each((_, el) => {
    const src =
      $(el).attr("data-src") ||
      $(el).attr("src") ||
      $(el).attr("data-lazy") ||
      "";
    if (!src || src.startsWith("data:")) return;
    urls.push(normalizeUrl(src, BASE));
  });

  // De-duplicate preserving order
  const unique = [...new Set(urls)];
  const coverUrl = unique[0] ?? "";
  const images = unique.slice(1).join("|");

  return { coverUrl, images };
}

function parseAvailability($: cheerio.CheerioAPI): string {
  const bodyText = $("body").text().toLowerCase();

  if (bodyText.includes("out of print") || bodyText.includes("sold out")) {
    return "sold out";
  }

  const addToCartLink = $('a[rel="add_to_cart"]').first();
  if (
    addToCartLink.length > 0 &&
    addToCartLink.text().toLowerCase().includes("add to cart")
  ) {
    return "available";
  }

  return "available";
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

  const { artist, title } = parseArtistTitle($);
  const description = parseDescription($);
  const { coverUrl, images } = parseImages($);
  const availability = parseAvailability($);

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
    process.argv[2] ?? join(process.cwd(), "output", "hassla.csv");
  const amountArg = Number(process.argv[3] ?? DEFAULT_AMOUNT);
  const amount =
    Number.isFinite(amountArg) && amountArg > 0 ? amountArg : DEFAULT_AMOUNT;

  console.log("Fetching homepage for product links...");
  const homepageHtml = await fetchHtml(BASE);
  const productUrls = getProductUrlsFromHomepage(homepageHtml).slice(0, amount);

  console.log(
    `Found ${productUrls.length} product URLs (target amount: ${amount}).`,
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

  for (let i = 0; i < productUrls.length; i++) {
    const url = productUrls[i];
    console.log(`[${i + 1}/${productUrls.length}] ${url}`);

    try {
      const row = await scrapeProduct(url);
      lines.push(rowToCsv(row));
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
