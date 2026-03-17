/**
 * Setanta Books scraper
 * Collection: https://www.setantabooks.com/collections/setanta-photography-books
 * Product pages: /collections/setanta-photography-books/products/...
 *
 * - artist: text after "by" inside p.product__vendor
 * - title: h1.product__title
 * - description: .product__description-inner.rte (HTML -> text)
 * - images: og:image as cover, rest from gallery images
 *
 * Run: npx tsx scripts/scrapers/setanta.ts [output-path]
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

const BASE = "https://www.setantabooks.com";
const COLLECTION_URL =
  "https://www.setantabooks.com/collections/setanta-photography-books";

/**
 * Collect product URLs from the Setanta Books collection page.
 * We look for anchors that point to /products/ under the collection.
 */
function getProductUrlsFromCollection(html: string): string[] {
  const $ = cheerio.load(html);
  const urls: string[] = [];

  // Be permissive: any link containing `/products/` under the collection content
  $('a[href*="/products/"]').each((_, el) => {
    let href = $(el).attr("href");
    if (!href) return;
    href = href.trim();

    // Ignore non-product paths or query fragments
    if (!href.includes("/products/")) return;

    const full = normalizeUrl(href.split("?")[0], BASE);
    if (!urls.includes(full)) urls.push(full);
  });

  return urls;
}

async function scrapeProductPage(productUrl: string): Promise<{
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

  // --- title ----------------------------------------------------------
  const title =
    $("h1.product__title").first().text().trim() ||
    $('meta[property="og:title"]')
      .attr("content")
      ?.replace(/\s*[|–-]\s*Setanta Books.*$/i, "")
      .trim() ||
    "";

  // --- artist ---------------------------------------------------------
  // HTML snippet:
  // <p class="product__vendor">
  //   <a ...>
  //     by
  //     Thibaut Derien
  //   </a>
  // </p>
  let artist = "";
  const vendorText = $("p.product__vendor a")
    .first()
    .text()
    .replace(/\s+/g, " ")
    .trim(); // "by Thibaut Derien"
  if (vendorText) {
    artist = vendorText.replace(/^by\s*/i, "").trim();
  }

  // --- description ----------------------------------------------------
  // Take the rich text block and convert HTML -> plain text with newlines.
  let description = "";
  const $desc = $(".product__description-inner.rte").first();
  if ($desc.length) {
    let descHtml = $desc.html() ?? "";
    descHtml = decodeHtmlEntities(descHtml);
    description = descHtml
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>\s*/gi, "\n")
      .replace(/<p[^>]*>/gi, "\n")
      .replace(/<\/h\d>\s*/gi, "\n")
      .replace(/<h\d[^>]*>/gi, "\n")
      .replace(/<\/div>\s*/gi, "\n")
      .replace(/<li[^>]*>/gi, "\n- ")
      .replace(/<\/li>\s*/gi, "\n")
      .replace(/<[^>]+>/g, " ") // strip remaining tags
      .replace(/\r/g, "")
      .replace(/\t/g, " ")
      .replace(/ \u00a0/g, " ")
      .replace(/\u00a0/g, " ")
      .replace(/[ \f\v]+/g, " ")
      .replace(/\n[ \t]+/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }
  if (!description) {
    description =
      $('meta[property="og:description"]').attr("content")?.trim() ?? "";
  }

  // --- images (cover + gallery) --------------------------------------
  const imageUrls: string[] = [];
  const ogImage = $('meta[property="og:image"]').attr("content");
  if (ogImage) {
    imageUrls.push(normalizeUrl(ogImage, BASE));
  }

  // Grab gallery images
  $(".product-gallery img, .product-gallery__item img, main img").each(
    (_, el) => {
      const src = $(el).attr("src");
      if (!src) return;
      if (src.startsWith("data:")) return;

      const full = normalizeUrl(src, BASE);
      if (!imageUrls.includes(full)) imageUrls.push(full);
    },
  );

  const uniqueImages = [...new Set(imageUrls)];
  const coverUrl = uniqueImages[0] ?? "";
  const maxExtra = 10; // keep some reasonable cap
  const images = uniqueImages.slice(1, 1 + maxExtra).join("|");

  // --- availability ---------------------------------------------------
  // Setanta uses Shopify; sold-out often appears as "Sold Out" in the page or
  // as "outofstock" classes for variants. We'll use a simple text heuristic.
  const bodyLower = $.root().text().toLowerCase();
  const soldOut =
    bodyLower.includes("sold out") || bodyLower.includes("out of stock");
  const availability = soldOut ? "sold-out" : "available";

  const artistExists = artist ? await artistExistsInDb(artist) : false;

  const purchaseLink =
    $('link[rel="canonical"]').attr("href")?.trim() || productUrl;
  const purchaseLinkNormalized = purchaseLink.startsWith("http")
    ? purchaseLink
    : normalizeUrl(purchaseLink, BASE);

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
    process.argv[2] ?? join(process.cwd(), "output", "setantabooks.csv");

  console.log("Fetching Setanta Books collection...");
  const indexHtml = await fetchHtml(COLLECTION_URL);
  let productUrls = getProductUrlsFromCollection(indexHtml);
  productUrls = [...new Set(productUrls)];
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
      const row = await scrapeProductPage(url);
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
