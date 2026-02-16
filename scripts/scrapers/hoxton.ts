/**
 * Hoxton Mini Press scraper
 * Fetches book data from https://www.hoxtonminipress.com/collections/photography
 * and writes CSV with: title, artist, artistExistsInDb, description, specs,
 * coverUrl, images, availability, purchaseLink
 *
 * Run: npx tsx scripts/scrapers/hoxton.ts [output-path]
 */

import * as cheerio from "cheerio";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import {
  artistExistsInDb,
  fetchHtml,
  normalizeUrl,
  rowToCsv,
} from "../scraperUtils";

const BASE = "https://www.hoxtonminipress.com";
const COLLECTION_URL = `${BASE}/collections/photography`;
const AMOUNT_OF_BOOKS = 3;

/** Parse "Title by Artist" or "'Title' by Artist" from first <em> to get artist */
function parseArtistFromEm(emText: string): string {
  const byIdx = emText.lastIndexOf(" by ");
  if (byIdx === -1) return emText.trim();
  return emText.slice(byIdx + 4).trim();
}

async function getAllProductUrls(): Promise<string[]> {
  console.log("Fetching collection:", COLLECTION_URL);
  const html = await fetchHtml(COLLECTION_URL);
  const $ = cheerio.load(html);
  const seen = new Set<string>();
  const urls: string[] = [];

  $('a[href*="/products/"]').each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    const pathOnly = href.split("?")[0];
    const full = normalizeUrl(pathOnly, BASE);
    const path = new URL(full).pathname;
    const match = path.match(/\/products\/([^/]+)/);
    if (!match) return;
    const productUrl = `${BASE}/products/${match[1]}`;
    if (!seen.has(productUrl)) {
      seen.add(productUrl);
      urls.push(productUrl);
    }
  });

  return urls;
}

async function scrapeProduct(productUrl: string): Promise<{
  title: string;
  artist: string;
  artistExistsInDb: boolean;
  description: string;
  specs: string;
  coverUrl: string;
  images: string;
  availability: string;
  purchaseLink: string;
}> {
  const html = await fetchHtml(productUrl);
  const $ = cheerio.load(html);

  const title =
    $("h1.product_name").first().text().trim() ||
    $("h1").first().text().trim() ||
    $('meta[property="og:title"]')
      .attr("content")
      ?.replace(/\s*[-–|]\s*Hoxton Mini Press\s*$/i, "")
      .trim() ||
    "";

  const descBlock = $(".description").first();
  const firstEm = descBlock.find("em").first();
  const artist = parseArtistFromEm(firstEm.text().trim());

  const paragraphs = descBlock.find("p").toArray();
  let specs = "";
  const descriptionParts: string[] = [];

  const isEuVatNotice = (p: (typeof paragraphs)[number]) => {
    const text = $(p).text().toLowerCase();
    return (
      text.includes("eu customers") &&
      (text.includes("vat may apply") ||
        text.includes("vat may apply on delivery"))
    );
  };

  let specsParagraphIndex = -1;
  for (let i = 0; i < paragraphs.length; i++) {
    if (!isEuVatNotice(paragraphs[i])) {
      specsParagraphIndex = i;
      break;
    }
  }

  if (specsParagraphIndex >= 0) {
    const specsPHtml = $(paragraphs[specsParagraphIndex]).html() ?? "";
    const withoutEm = specsPHtml.replace(
      /<em[^>]*>[\s\S]*?<\/em>\s*\.?\s*/i,
      "",
    );
    specs = withoutEm
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/gi, " ")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)
      .join("\n")
      .trim();
  }
  for (let i = specsParagraphIndex + 1; i < paragraphs.length; i++) {
    if (!isEuVatNotice(paragraphs[i])) {
      descriptionParts.push(
        $(paragraphs[i]).text().trim().replace(/\s+/g, " "),
      );
    }
  }
  const description = descriptionParts.filter(Boolean).join("\n\n");

  const imageUrls: string[] = [];
  $(
    ".product__media img, .product-photo-container img, [data-product-images] img, .product img",
  ).each((_, el) => {
    const src =
      $(el).attr("data-src") || $(el).attr("data-zoom") || $(el).attr("src");
    if (src && !src.startsWith("data:") && !imageUrls.includes(src)) {
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

  const productSection = $(".product, [data-product], main").first();
  const sectionText = productSection.text().toLowerCase();
  const hasSoldOutText = sectionText.includes("sold out");
  const hasSoldOutBadge =
    $(".price__badge--sold-out, .badge--sold-out, .sold-out").length > 0;
  const addDisabled =
    $(".product-form__submit[disabled], [name='add'][disabled]").length > 0;
  const availability =
    hasSoldOutText || hasSoldOutBadge || addDisabled ? "sold out" : "available";

  const purchaseLink =
    $('link[rel="canonical"]').attr("href")?.trim() || productUrl;

  const artistExists = await artistExistsInDb(artist);

  return {
    title,
    artist,
    artistExistsInDb: artistExists,
    description,
    specs,
    coverUrl,
    images,
    availability,
    purchaseLink: purchaseLink.startsWith("http")
      ? purchaseLink
      : normalizeUrl(purchaseLink, BASE),
  };
}

async function main() {
  const outPath =
    process.argv[2] ?? join(process.cwd(), "output", "hoxton.csv");

  console.log("Fetching product list...");
  const productUrls = await getAllProductUrls();
  console.log(`Found ${productUrls.length} product URLs.`);

  const header: Record<string, string> = {
    title: "title",
    artist: "artist",
    artistExistsInDb: "artistExistsInDb",
    description: "description",
    specs: "specs",
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
