/**
 * The Velvet Cell scraper (standalone)
 * Base: https://thevelvetcell.com
 * Product pages: https://thevelvetcell.com/shop/*
 * Title: h3.product__title, Artist: h4
 *
 * Run: npx tsx scripts/scrapers/thevelvetcell.ts [output-path]
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

const BASE = "https://thevelvetcell.com";
const COLLECTION_URL = `${BASE}/catalogue`;

async function getProductUrls(collectionHtml: string): Promise<string[]> {
  const $ = cheerio.load(collectionHtml);
  const urls: string[] = [];
  $('a[href*="/shop/"]').each((_, el) => {
    const href = $(el).attr("href");
    if (href) {
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
    $("h3.product__title").first().text().trim() ||
    $('meta[property="og:title"]')
      .attr("content")
      ?.replace(/\s*—\s*The Velvet\s*Cell\s*$/i, "")
      .trim() ||
    "";

  const $block = $("div.information__item--grow, div.information__item");
  const artist =
    $block.find("h3.product__title").first().next("h4").text().trim() ||
    $block.find("h4").first().text().trim() ||
    "";

  let description =
    $('meta[name="description"]').attr("content")?.trim() ||
    $(".content__item--text .block__text.text p")
      .map((_, el) => $(el).text().trim())
      .get()
      .join("\n\n")
      .trim() ||
    "";

  const specsParts: string[] = [];
  $("#details .grid--details.product--details li").each((_, el) => {
    const label = $(el).find("h3").text().trim();
    const value = $(el).clone().children("h3").remove().end().text().trim();
    if (label && value) specsParts.push(`${label}: ${value}`);
  });
  const finalDescription = [description, specsParts.join("; ")]
    .filter(Boolean)
    .join("\n\n");

  const imageUrls: string[] = [];
  $(".carousel__slide .picture").each((_, pictureEl) => {
    const $pic = $(pictureEl);
    const src = $pic.find("img").attr("src");
    if (src && !src.startsWith("data:")) {
      imageUrls.push(normalizeUrl(src, BASE));
      return;
    }
    const firstSource = $pic.find("source[srcset]").first();
    const srcset = firstSource.attr("srcset");
    if (srcset) {
      const firstUrl = srcset.split(",")[0]?.trim().split(/\s+/)[0];
      if (firstUrl) imageUrls.push(normalizeUrl(firstUrl, BASE));
    }
  });
  const uniqueImages = [...new Set(imageUrls)];
  const coverUrl = uniqueImages[0] ?? "";
  const images = uniqueImages.slice(1).join("|");

  const purchaseLink =
    $('link[rel="canonical"]').attr("href")?.trim() || productUrl;
  const finalPurchaseLink = purchaseLink.startsWith("http")
    ? purchaseLink
    : normalizeUrl(purchaseLink, BASE);

  const artistExists = await artistExistsInDb(artist);

  return {
    title,
    artist,
    artistExistsInDb: artistExists,
    description: finalDescription,
    coverUrl,
    images,
    availability: "available",
    purchaseLink: finalPurchaseLink,
  };
}

async function main() {
  const outPath = process.argv[2] ?? join(process.cwd(), "output", "tvc.csv");

  console.log("Fetching product list...");
  const collectionHtml = await fetchHtml(COLLECTION_URL);
  const productUrls = await getProductUrls(collectionHtml);
  console.log(`Found ${productUrls.length} product URLs`);

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
