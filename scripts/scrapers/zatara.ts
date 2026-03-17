/**
 * Zatara Press scraper
 * https://zatarapress.com/publications/
 * Fetches product URLs from the publications listing, then scrapes each product page
 * and writes CSV: title, artist, artistExistsInDb, description, coverUrl, images,
 * availability, purchaseLink
 *
 * Run: npx tsx scripts/scrapers/zatara.ts [output-path]
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

const BASE = "https://zatarapress.com";
const LISTING_URL = `${BASE}/publications/`;

/** Collect product URLs from the publications listing page */
function getProductUrlsFromHtml(html: string): string[] {
  const $ = cheerio.load(html);
  const urls: string[] = [];
  $("ul.products li.product a.woocommerce-LoopProduct-link").each((_, el) => {
    const href = $(el).attr("href");
    if (href && href.startsWith(BASE)) {
      const full = normalizeUrl(href.split("?")[0], BASE);
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
  coverUrl: string;
  images: string;
  availability: string;
  purchaseLink: string;
}> {
  const html = await fetchHtml(productUrl);
  const $ = cheerio.load(html);

  const title =
    $("h1.product_title.entry-title").first().text().trim() ||
    $('meta[property="og:title"]')
      .attr("content")
      ?.replace(/\s*[|–-]\s*Zatara Press.*$/i, "")
      .trim() ||
    "";

  let artist = "";
  const shortDescBlock = $(".woocommerce-product-details__short-description");
  const firstLink = shortDescBlock.find("a").first();
  if (firstLink.length) {
    artist = firstLink.text().trim();
  }

  const shortSpecs = shortDescBlock
    .clone()
    .find("a")
    .first()
    .parent()
    .remove()
    .end()
    .end()
    .text()
    .trim()
    .replace(/\s+/g, " ");

  let fullDesc = "";
  const fullDescPanel = $(
    "#tab-description, .woocommerce-Tabs-panel--description",
  ).first();
  if (fullDescPanel.length) {
    const clone = fullDescPanel.clone();
    clone.find("h2").first().remove();
    fullDesc =
      clone
        .html()
        ?.replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>\s*/gi, "\n")
        .replace(/<p[^>]*>/gi, "\n")
        .replace(/<[^>]+>/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim() ?? "";
    fullDesc = decodeHtmlEntities(fullDesc).trim();
  }
  const description = [shortSpecs, fullDesc].filter(Boolean).join("\n\n");

  const imageUrls: string[] = [];
  const ogImage = $('meta[property="og:image"]').attr("content");
  if (ogImage) imageUrls.push(normalizeUrl(ogImage, BASE));
  $(".woocommerce-product-gallery__image a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (href && !href.startsWith("data:") && !imageUrls.includes(href)) {
      imageUrls.push(normalizeUrl(href, BASE));
    }
  });
  const uniqueImages = [...new Set(imageUrls)];
  const coverUrl = uniqueImages[0] ?? "";
  const maxExtra = 5;
  const images = uniqueImages.slice(1, 1 + maxExtra).join("|");

  const purchaseLink =
    $('link[rel="canonical"]').attr("href")?.trim() || productUrl;
  const purchaseLinkNormalized = purchaseLink.startsWith("http")
    ? purchaseLink
    : normalizeUrl(purchaseLink, BASE);

  const soldOut =
    $(".wcsob_soldout, .outofstock").length > 0 ||
    $(".product").hasClass("outofstock");
  const availability = soldOut ? "sold-out" : "available";

  const artistExists = artist ? await artistExistsInDb(artist) : false;

  return {
    title,
    artist,
    artistExistsInDb: artistExists,
    description,
    coverUrl,
    images,
    availability,
    purchaseLink: purchaseLinkNormalized,
  };
}

async function main() {
  const outPath =
    process.argv[2] ?? join(process.cwd(), "output", "zatara.csv");

  console.log("Fetching publications listing...");
  const listingHtml = await fetchHtml(LISTING_URL);
  const productUrls = getProductUrlsFromHtml(listingHtml);
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
