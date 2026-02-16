/**
 * Jane & Jeremy scraper
 * Fetches book/product data from https://www.jane-jeremy.co.uk/shop3
 * and writes CSV with: title, artist, artistExistsInDb, description, specs,
 * coverUrl, images, availability, purchaseLink
 *
 * Run: npx tsx scripts/scrapers/janejeremy.ts [output-path]
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

const BASE = "https://www.jane-jeremy.co.uk";
const SHOP_URL = `${BASE}/shop3`;
const AMOUNT_OF_BOOKS = 3;

function parseTitleAndArtist(rawTitle: string): {
  title: string;
  artist: string;
} {
  const t = rawTitle.trim();
  const pipeIdx = t.indexOf(" | ");
  if (pipeIdx > -1) {
    return {
      title: t.slice(pipeIdx + 3).trim(),
      artist: t.slice(0, pipeIdx).trim(),
    };
  }
  const byIdx = t.lastIndexOf(" by ");
  if (byIdx > -1) {
    return {
      title: t.slice(0, byIdx).trim(),
      artist: t.slice(byIdx + 4).trim(),
    };
  }
  return { title: t, artist: "" };
}

async function getAllProductUrls(): Promise<string[]> {
  console.log("Fetching shop:", SHOP_URL);
  const html = await fetchHtml(SHOP_URL);
  const $ = cheerio.load(html);
  const seen = new Set<string>();
  const urls: string[] = [];

  $('a[href*="/shop3/p/"]').each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    const full = normalizeUrl(href.split("?")[0], BASE);
    if (!seen.has(full)) {
      seen.add(full);
      urls.push(full);
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

  const rawTitle =
    $("h1.product-title").first().text().trim() ||
    $('meta[property="og:title"]')
      .attr("content")
      ?.replace(/\s*—\s*Jane\s*&\s*Jeremy$/i, "")
      .trim() ||
    "";
  const { title, artist } = parseTitleAndArtist(rawTitle);

  const descBlock = $(".product-description").first();
  const paragraphs = descBlock.find("p").toArray();
  let description = "";
  let specs = "";

  for (const p of paragraphs) {
    const text = $(p).text().trim();
    if (text.startsWith("Details")) {
      let specHtml = $(p).html() ?? "";
      specHtml = specHtml.replace(
        /^\s*<strong>\s*Details\s*:?\s*<\/strong>\s*/i,
        "",
      );
      specs = specHtml
        .replace(/<br\s*\/?>/gi, "\n")
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
        .join("\n");
      specs = specs.replace(/^Details:?\s*\n?/i, "").trim();
      break;
    }
    description =
      (description ? description + "\n\n" : "") + text.replace(/\s+/g, " ");
  }

  const imageUrls: string[] = [];
  $(
    ".product-gallery-thumbnails-item-image, .product-gallery-slides-item-image",
  ).each((_, el) => {
    const src =
      $(el).attr("data-image") || $(el).attr("data-src") || $(el).attr("src");
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

  const availabilityMeta = $('meta[property="product:availability"]').attr(
    "content",
  );
  const soldOutText = $(".product-mark.sold-out")
    .text()
    .toLowerCase()
    .includes("sold out");
  const isSoldOut = availabilityMeta?.toLowerCase() === "oos" || soldOutText;
  const availability = isSoldOut ? "sold out" : "available";

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
    purchaseLink: productUrl,
  };
}

async function main() {
  const outPath =
    process.argv[2] ?? join(process.cwd(), "output", "janejeremy.csv");

  console.log("Fetching product list...");
  const productUrls = (await getAllProductUrls()).slice(0, AMOUNT_OF_BOOKS);
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
