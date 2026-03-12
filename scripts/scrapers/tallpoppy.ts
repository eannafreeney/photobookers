/**
 * Tall Poppy Press scraper
 * https://www.tallpoppypress.xyz/books
 * Product pages at /product/{slug}
 * Title + artist from product info; description from .u-rich-text.w-richtext
 *
 * Run: npx tsx scripts/scrapers/tallpoppy.ts [output-path]
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

const BASE = "https://www.tallpoppypress.xyz";
const BOOKS_URL = `${BASE}/books`;

function getProductUrlsFromHtml(html: string): string[] {
  const $ = cheerio.load(html);
  const seen = new Set<string>();
  const urls: string[] = [];

  $('a[href*="/product/"]').each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    const pathOnly = href.split("?")[0].trim();
    if (!pathOnly || pathOnly === "/product" || pathOnly === "/product/")
      return;
    const full = normalizeUrl(pathOnly, BASE);
    if (!seen.has(full)) {
      seen.add(full);
      urls.push(full);
    }
  });

  return urls;
}

async function getAllProductUrls(): Promise<string[]> {
  console.log("Fetching books listing:", BOOKS_URL);
  const html = await fetchHtml(BOOKS_URL);
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

  const ogTitle = $('meta[property="og:title"]').attr("content")?.trim() ?? "";
  const titleFromMeta =
    ogTitle && ogTitle.includes(" - ")
      ? ogTitle.replace(/\s*-\s*[^-]+$/, "").trim()
      : "";
  const title =
    $(".product_info .text-wrapper.u-style-allcaps .u-text")
      .first()
      .text()
      .trim() ||
    $(".product_info .u-text").first().text().trim() ||
    titleFromMeta ||
    ogTitle ||
    "";

  const authorLinks = $(".product_authors a.btn.is-info .btn_text");
  const artists: string[] = [];
  authorLinks.each((_, el) => {
    const t = $(el).text().trim();
    if (t && !artists.includes(t)) artists.push(t);
  });
  const artist = artists.length ? artists.join(" & ") : "";

  let description = "";
  const descBlock = $(
    ".main_index_content .text-wrapper .u-rich-text.w-richtext",
  ).first();
  if (descBlock.length) {
    let descHtml = descBlock.html() ?? "";
    description = decodeHtmlEntities(descHtml)
      .replace(/<\/p>\s*/gi, "\n")
      .replace(/<p[^>]*>/gi, "\n")
      .replace(/<em[^>]*>/gi, "")
      .replace(/<\/em>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/^\s+|\s+$/g, "")
      .trim();
  }
  if (!description && $('meta[property="og:description"]').length) {
    description = decodeHtmlEntities(
      $('meta[property="og:description"]').attr("content") ?? "",
    ).trim();
  }

  const coverUrl = normalizeUrl(
    $('meta[property="og:image"]').attr("content") ?? "",
    BASE,
  );

  const imageUrls: string[] = [];
  $(".swiper.is-product img.swiper-img.is-book").each((_, el) => {
    const src = $(el).attr("src");
    if (src && !src.startsWith("data:")) {
      const full = normalizeUrl(src, BASE);
      if (!imageUrls.includes(full)) imageUrls.push(full);
    }
  });
  if (coverUrl && !imageUrls.includes(coverUrl)) {
    imageUrls.unshift(coverUrl);
  }
  const uniqueImages = [...new Set(imageUrls)];
  const firstCover = (uniqueImages[0] ?? coverUrl) || "";
  const restImages = uniqueImages.filter((u) => u !== firstCover);
  const images = restImages.join("|");

  const bodyText = $.root().text().toLowerCase();
  const availability =
    bodyText.includes("sold out") || bodyText.includes("out of stock")
      ? "sold out"
      : "available";

  const artistExists = artist ? await artistExistsInDb(artist) : false;

  return {
    title,
    artist,
    artistExistsInDb: artistExists,
    description,
    coverUrl: firstCover || coverUrl,
    images,
    availability,
    purchaseLink: productUrl,
  };
}

async function main() {
  const outPath =
    process.argv[2] ?? join(process.cwd(), "output", "tallpoppy.csv");

  console.log("Fetching product URLs from books page...");
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
