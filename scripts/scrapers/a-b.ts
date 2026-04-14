/**
 * AINT-BAD scraper
 * https://aint-bad.com/product-category/books/
 * WooCommerce site — paginated product listing, individual product pages.
 *
 * title/artist: h1.product_title split on " : " (artist : title)
 * description:  "About" prose from #tab-description .three-columns-two.last
 * images:       WooCommerce product gallery img[data-src]
 * availability: outofstock CSS class on product wrapper
 *
 * Run: npx tsx scripts/scrapers/a-b.ts [output-path]
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

const BASE = "https://aint-bad.com";
const BOOKS_CATEGORY = `${BASE}/product-category/books/`;

async function getProductUrls(): Promise<string[]> {
  const urls: string[] = [];
  let page = 1;

  while (true) {
    const url =
      page === 1 ? BOOKS_CATEGORY : `${BOOKS_CATEGORY}page/${page}/`;

    let html: string;
    try {
      html = await fetchHtml(url);
    } catch {
      break;
    }

    const $ = cheerio.load(html);
    let found = 0;

    $("ul.products li.product a.woocommerce-LoopProduct-link").each((_, el) => {
      const href = $(el).attr("href");
      if (href && !urls.includes(href)) {
        urls.push(href);
        found++;
      }
    });

    if (found === 0 || !$("a.next.page-numbers").length) break;
    page++;
  }

  return urls;
}

async function scrapeProductPage(pageUrl: string): Promise<{
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

  // "Artist : Title" → split on first " : "
  const fullTitle = $("h1.product_title.entry-title").first().text().trim();
  let title = fullTitle;
  let artist = "";
  const sep = fullTitle.indexOf(" : ");
  if (sep !== -1) {
    artist = fullTitle.slice(0, sep).trim();
    title = fullTitle.slice(sep + 3).trim();
  }

  // Description from the "About" prose in the tab panel
  let description = "";
  const $aboutCol = $("#tab-description .three-columns-two.last");
  if ($aboutCol.length) {
    const paragraphs: string[] = [];
    $aboutCol.find("p").each((_, el) => {
      const $p = $(el);
      // Skip header-only paragraphs (e.g. "<p><strong>About</strong> :</p>")
      const text = $p.text().trim();
      const isHeaderOnly =
        $p.children().length === 1 &&
        $p.children().first().is("strong") &&
        text.length < 40;
      if (!isHeaderOnly && text) paragraphs.push(text);
    });
    description = paragraphs.join("\n").trim();
  }

  // Fallback: short description (artist bio visible above fold)
  if (!description) {
    const raw = $(".woocommerce-product-details__short-description").html() ?? "";
    description = decodeHtmlEntities(
      raw
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n")
        .replace(/<[^>]+>/g, ""),
    )
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s && !/^sold\s*out$/i.test(s))
      .join("\n")
      .trim();
  }

  // Gallery images — use data-src (full size) with src fallback
  const imageUrls: string[] = [];
  $(".woocommerce-product-gallery__image").each((_, el) => {
    const img = $(el).find("img").first();
    const src = img.attr("data-src") ?? img.attr("src");
    if (src && !src.startsWith("data:")) imageUrls.push(src);
  });
  const coverUrl = imageUrls[0] ?? "";
  const images = imageUrls.slice(1).join("|");

  // Availability: WooCommerce adds "outofstock" class to the product wrapper
  const isOutOfStock =
    $("#primary .product").first().hasClass("outofstock") ||
    $(".woocommerce-product-details__short-description")
      .text()
      .toLowerCase()
      .includes("sold out");
  const availability = isOutOfStock ? "sold_out" : "available";

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
    process.argv[2] ?? join(process.cwd(), "output", "a-b.csv");

  console.log("Fetching product listing pages...");
  const productUrls = await getProductUrls();
  console.log(`Found ${productUrls.length} product URLs.`);

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

  for (let i = 0; i < productUrls.length; i++) {
    const url = productUrls[i];
    console.log(`[${i + 1}/${productUrls.length}] ${url}`);
    try {
      const row = await scrapeProductPage(url);
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
