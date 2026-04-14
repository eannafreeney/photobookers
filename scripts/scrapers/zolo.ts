/**
 * Zolo Press scraper
 * https://zolo.press/books
 * Custom CMS with Shopify buy buttons.
 *
 * title:        h1.g-issue__title
 * artist:       p.g-issue__author
 * description:  .g-issue__description p text
 * images:       slider img[data-src] (non-duplicate slides, desktop ratio)
 * availability: "sold_out" if no Shopify buy button present, else "available"
 *               "pre_order" if button text is "Pre-order"
 *
 * Run: npx tsx scripts/scrapers/zolo.ts [output-path]
 */
import "../env";
import * as cheerio from "cheerio";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import {
  artistExistsInDb,
  decodeHtmlEntities,
  fetchHtml,
  rowToCsv,
} from "../scraperUtils";

const BASE = "https://zolo.press";
const BOOKS_URL = `${BASE}/books`;

async function getBookUrls(): Promise<string[]> {
  const html = await fetchHtml(BOOKS_URL);
  const $ = cheerio.load(html);
  const urls: string[] = [];

  $("a.c-book-card__title[href]").each((_, el) => {
    const href = $(el).attr("href") ?? "";
    const full = href.startsWith("http") ? href : `${BASE}${href}`;
    // Only /books/ paths, not /editions/ or /talks/
    if (full.includes("/books/") && !urls.includes(full)) {
      urls.push(full);
    }
  });

  return urls;
}

async function scrapeBookPage(pageUrl: string): Promise<{
  title: string;
  artist: string;
  artistExistsInDb: boolean;
  description: string;
  coverUrl: string;
  images: string;
  availability: string;
  purchaseLink: string;
}> {
  const html = await fetchHtml(pageUrl);
  const $ = cheerio.load(html);

  const title = $("h1.g-issue__title").first().text().trim();
  const artist = $("p.g-issue__author").first().text().trim();

  // Description from the rich-text block
  const $desc = $(".g-issue__description");
  let description = "";
  if ($desc.length) {
    const raw = $desc.html() ?? "";
    description = decodeHtmlEntities(
      raw
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n")
        .replace(/<p[^>]*>/gi, "")
        .replace(/<[^>]+>/g, ""),
    )
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)
      .join("\n")
      .trim();
  }

  // Slider images — skip Swiper duplicate clones, take desktop img.g-slider__img
  const imageUrls: string[] = [];
  $(".g-slider__item").each((_, slide) => {
    const $slide = $(slide);
    // Swiper duplicates have class "swiper-slide-duplicate"
    if ($slide.hasClass("swiper-slide-duplicate")) return;
    const src =
      $slide.find("img.g-slider__img").first().attr("data-src") ??
      $slide.find("img.g-slider__img").first().attr("src");
    if (!src) return;
    const full = src.startsWith("http") ? src : `${BASE}${src}`;
    if (!imageUrls.includes(full)) imageUrls.push(full);
  });
  const coverUrl = imageUrls[0] ?? "";
  const images = imageUrls.slice(1).join("|");

  // Availability: check buy-button wrapper and its button text
  const $btnWrap = $(".js-shopify-product").first();
  let availability = "available";
  if (!$btnWrap.length) {
    availability = "sold_out";
  } else {
    const btnText = $btnWrap.find("button.c-book-card__addcart, button.shopify-buy__btn")
      .first()
      .text()
      .trim()
      .toLowerCase();
    if (btnText === "pre-order" || $btnWrap.attr("data-preorder") === "1") {
      availability = "pre_order";
    }
  }

  const purchaseLink =
    $('link[rel="canonical"]').attr("href")?.trim() || pageUrl;

  const artistExists = artist ? await artistExistsInDb(artist) : false;

  return {
    title,
    artist,
    artistExistsInDb: artistExists,
    description,
    coverUrl,
    images,
    availability,
    purchaseLink,
  };
}

async function main() {
  const outPath =
    process.argv[2] ?? join(process.cwd(), "output", "zolo.csv");

  console.log("Fetching book list...");
  const bookUrls = await getBookUrls();
  console.log(`Found ${bookUrls.length} books.`);

  const header = {
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

  for (let i = 0; i < bookUrls.length; i++) {
    const url = bookUrls[i];
    console.log(`[${i + 1}/${bookUrls.length}] ${url}`);
    try {
      const row = await scrapeBookPage(url);
      console.log(`  "${row.title}" by ${row.artist} — ${row.availability}`);
      lines.push(rowToCsv(row));
    } catch (err) {
      console.error(`  Error scraping ${url}:`, err);
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
