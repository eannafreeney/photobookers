/**
 * The Eriskay Connection scraper
 * https://www.eriskayconnection.com/
 * Title: h2, Artist: h3 span, Description: .contentBox.singleProductAbout
 * Images: exclude .selected-image
 *
 * Run: npx tsx scripts/scrapers/eriskayconnection.ts [output-path]
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

const BASE = "https://www.eriskayconnection.com";

const AMOUNT_OF_BOOKS = 10;
/** Listing pages that contain links to product pages. Adjust if the site uses different paths. */

function getProductUrlsFromHtml(html: string): string[] {
  const $ = cheerio.load(html);
  const seen = new Set<string>();
  const urls: string[] = [];

  $('a[aria-label^="View product:"]').each((_, el) => {
    const href = $(el).attr("href");
    if (!href || href.startsWith("#")) return;
    const full = normalizeUrl(href.split("?")[0], BASE);
    if (full === BASE || full === BASE + "/") return;
    if (seen.has(full)) return;
    seen.add(full);
    urls.push(full);
  });

  return urls;
}

async function getAllProductUrls(): Promise<string[]> {
  const url = BASE; // https://www.eriskayconnection.com
  console.log("Fetching:", url);
  const html = await fetchHtml(url);
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

  const title = $(".uppercase h2").first().text().trim() || "";
  const artist = $("h3 span").first().text().trim() || "";

  const descEl = $(".contentBox.singleProductAbout").first();
  let description = descEl.text().trim();
  description = decodeHtmlEntities(description).replace(/\s+/g, " ").trim();

  const imageUrls: string[] = [];
  $("img")
    .filter((_, el) => $(el).closest(".selected-image").length === 0)
    .each((_, el) => {
      const src = $(el).attr("src") || $(el).attr("data-src");
      if (src && !src.startsWith("data:") && !imageUrls.includes(src)) {
        imageUrls.push(normalizeUrl(src, BASE));
      }
    });

  const uniqueImages = [...new Set(imageUrls)];
  const coverUrl = uniqueImages[0] ?? "";
  const images = uniqueImages.slice(1).join("|");

  const pageText = $("body").text().toLowerCase();
  const availability = pageText.includes("sold out") ? "sold out" : "available";

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
    process.argv[2] ?? join(process.cwd(), "output", "eriskayconnection.csv");

  console.log("Fetching product URLs...");
  const productUrls = (await getAllProductUrls()).slice(0, AMOUNT_OF_BOOKS);
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
