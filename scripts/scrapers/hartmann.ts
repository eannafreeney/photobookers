/**
 * Hartmann Books scraper
 * Fetches book data from https://hartmann-books.com/en/produkt-kategorie/books/
 * (paginated, 3 pages) and writes CSV with: title, artist, artistExistsInDb,
 * description, coverUrl, images, availability, tags, purchaseLink
 *
 * Run: npx tsx scripts/scrapers/scrape-hartmann.ts [output-path]
 */
import "../../scripts/env";

import * as cheerio from "cheerio";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import {
  artistExistsInDb,
  fetchHtml,
  normalizeUrl,
  rowToCsv,
} from "../scraperUtils";

const BASE = "https://hartmann-books.com";
const CATEGORY_BASE = `${BASE}/en/produkt-kategorie/books`;
const TOTAL_PAGES = 3;
const AMOUNT_OF_BOOKS = 3;

async function getAllProductUrls(): Promise<string[]> {
  const allUrls: string[] = [];
  const seen = new Set<string>();

  for (let page = 1; page <= TOTAL_PAGES; page++) {
    const url =
      page === 1 ? `${CATEGORY_BASE}/` : `${CATEGORY_BASE}/page/${page}/`;
    console.log(`Fetching page ${page}/${TOTAL_PAGES}: ${url}`);
    const html = await fetchHtml(url);
    const $ = cheerio.load(html);
    $('a[href*="/produkt/"]').each((_, el) => {
      const href = $(el).attr("href");
      if (href) {
        const full = normalizeUrl(href, BASE);
        if (!seen.has(full)) {
          seen.add(full);
          allUrls.push(full);
        }
      }
    });
  }
  return allUrls;
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
    $("h1.product-title").first().text().trim() ||
    $('meta[property="og:title"]')
      .attr("content")
      ?.replace(/\s*\|\s*Hartmann Books$/, "")
      .trim() ||
    "";

  const h1Html = $("h1.product-title").first().html() ?? "";
  const parts = h1Html
    .split(/<br\s*\/?>/i)
    .map((s) => cheerio.load(s).text().trim())
    .filter(Boolean);
  const artist = parts[0] ?? "";
  const title = parts.slice(1).join(" ").trim() || rawTitle;

  const description =
    $(".panel.entry-content").first().text().trim() ||
    $('meta[name="description"]').attr("content")?.trim() ||
    "";

  const imageUrls: string[] = [];
  $(".woocommerce-product-gallery__image img").each((_, el) => {
    const src =
      $(el).attr("data-large_image") ||
      $(el).attr("data-src") ||
      $(el).attr("src");
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

  const artistExists = await artistExistsInDb(artist);

  return {
    title,
    artist,
    artistExistsInDb: artistExists,
    description,
    coverUrl,
    images,
    availability: "available",
    purchaseLink: productUrl,
  };
}

async function main() {
  const outPath =
    process.argv[2] ?? join(process.cwd(), "output", "hartmann.csv");

  console.log("Fetching category pages...");
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
