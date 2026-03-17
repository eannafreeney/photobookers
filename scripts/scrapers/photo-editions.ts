/**
 * Photo Editions scraper
 * Site: https://photoeditions.pub/
 * Cargo Collective site. Project pages: /Reverie, /Lost-in-Kyoto, etc.
 *
 * - title/artist: h2 in main content as "Title by Artist" (split on " by ")
 * - description: content of small tag in main .page_content
 * - coverUrl / images: from .content_container (main area only)
 * - purchaseLink: first external link in description or canonical
 * - availability: "available" unless page mentions sold out
 *
 * Run: npx tsx scripts/scrapers/photo-editions.ts [output-path]
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

const BASE = "https://photoeditions.pub";

const SKIP_HREFS = new Set([
  "",
  "/",
  "Main-page",
  "/Main-page",
  "Information",
  "/Information",
  "https://www.instagram.com/photoeditions.books/",
  "mailto:photoeditionsbooks@gmail.com",
  "mailto: photoeditionsbooks@gmail.com",
]);

function getProjectPathsFromHtml(html: string): string[] {
  const $ = cheerio.load(html);
  const paths = new Set<string>();
  $("a[href]").each((_, el) => {
    let href = $(el).attr("href")?.trim();
    if (!href) return;
    href = href.replace(/^\//, "");
    if (SKIP_HREFS.has(href) || SKIP_HREFS.has("/" + href)) return;
    if (href.startsWith("http") && !href.startsWith(BASE)) return;
    if (href.startsWith("http")) {
      try {
        const u = new URL(href);
        if (u.origin !== new URL(BASE).origin) return;
        href = u.pathname.replace(/^\//, "");
      } catch {
        return;
      }
    }
    if (!href || href.includes(" ")) return;
    paths.add(href);
  });
  return [...paths];
}

async function scrapeProjectPage(pageUrl: string): Promise<{
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

  // Main book content is inside .content_container (skip pinned header/footer)
  const $content = $(".content_container .page_content").first();

  let title = "";
  let artist = "";
  const h2Text = $content.find("h2").first().text().trim();
  if (h2Text) {
    const byIndex = h2Text.indexOf(" by ");
    if (byIndex !== -1) {
      title = h2Text.slice(0, byIndex).trim();
      artist = h2Text.slice(byIndex + 4).trim();
    } else {
      title = h2Text;
    }
  }
  if (!title) {
    const ogTitle = $('meta[property="og:title"]').attr("content") ?? "";
    const cleaned = ogTitle
      .replace(/\s*[—–-]\s*Photo Editions\s*$/i, "")
      .trim();
    const byIndex = cleaned.indexOf(" by ");
    if (byIndex !== -1) {
      title = cleaned.slice(0, byIndex).trim();
      artist = cleaned.slice(byIndex + 4).trim();
    } else {
      title = cleaned;
    }
  }

  let description = "";
  const $small = $content.find("small").first();
  if ($small.length) {
    let raw = $small.html() ?? "";
    raw = decodeHtmlEntities(raw)
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>\s*/gi, "\n")
      .replace(/<p[^>]*>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    description = raw;
  }
  if (!description) {
    description =
      $('meta[property="og:description"]').attr("content")?.trim() ?? "";
  }

  // Images from main content area (covers inline + gallery)
  const imageUrls: string[] = [];
  $(".content_container img").each((_, el) => {
    const src =
      $(el).attr("data-src") ??
      $(el).attr("data-lazy-src") ??
      $(el).attr("src");
    if (!src || src.startsWith("data:")) return;
    const full = normalizeUrl(src, BASE);
    if (full.includes("freight.cargo.site") || full.includes("cargo.site")) {
      imageUrls.push(full);
    }
  });
  const uniqueImages = [...new Set(imageUrls)];
  const coverUrl = uniqueImages[0] ?? "";
  const images = uniqueImages.slice(1, 6).join("|");

  let purchaseLink = $('link[rel="canonical"]').attr("href")?.trim() || pageUrl;
  $content.find("small a[href^='http']").each((_, el) => {
    const href = $(el).attr("href");
    if (
      href &&
      !href.includes("instagram.com") &&
      !href.startsWith("mailto:")
    ) {
      purchaseLink = href;
      return false;
    }
  });
  if (!purchaseLink.startsWith("http")) {
    purchaseLink = normalizeUrl(purchaseLink, BASE);
  }

  const bodyLower = $("body").text().toLowerCase();
  const availability =
    bodyLower.includes("sold out") || bodyLower.includes("out of stock")
      ? "sold_out"
      : "available";

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
    process.argv[2] ?? join(process.cwd(), "output", "photo-editions.csv");
  console.log("Fetching homepage for project list...");
  const homeHtml = await fetchHtml(BASE);
  const projectPaths = getProjectPathsFromHtml(homeHtml);
  const projectUrls = projectPaths.map((p) =>
    p.startsWith("http") ? p : normalizeUrl("/" + p, BASE),
  );
  console.log(`Found ${projectUrls.length} project URLs.`);

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

  for (let i = 0; i < projectUrls.length; i++) {
    const url = projectUrls[i];
    console.log(`[${i + 1}/${projectUrls.length}] ${url}`);
    try {
      const row = await scrapeProjectPage(url);
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
