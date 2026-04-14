/**
 * Chose Commune scraper
 * https://chosecommune.com/
 * WooCommerce + custom theme. Books live under /book/[slug].
 *
 * title:        p.product-title
 * artist:       p.artist-name
 * description:  .col.text-intro — h2 teaser + body paragraphs
 * images:       .d-none.d-lg-block img.attachment-super-large (desktop stack)
 * availability: text in .stock-icon ("in stock" / "last copies" / "pre-order" / "out of stock")
 *
 * Book URLs collected from:
 *   /current-titles, /forthcoming, /out-of-print
 *
 * Run: npx tsx scripts/scrapers/cc.ts [output-path]
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

const BASE = "https://chosecommune.com";
const LISTING_PAGES = [
  `${BASE}/current-titles`,
  `${BASE}/forthcoming`,
  `${BASE}/out-of-print`,
];

async function getBookUrls(): Promise<string[]> {
  const seen = new Set<string>();

  for (const listUrl of LISTING_PAGES) {
    let html: string;
    try {
      html = await fetchHtml(listUrl);
    } catch (err) {
      console.warn(`  Could not fetch ${listUrl}:`, err);
      continue;
    }

    const $ = cheerio.load(html);

    // Every grid item has at least one <a href="/book/..."> inside it
    $("a[href]").each((_, el) => {
      const href = $(el).attr("href") ?? "";
      const full = href.startsWith("http") ? href : `${BASE}${href}`;
      if (
        full.startsWith(`${BASE}/book/`) &&
        !full.includes("/book/club") &&
        !seen.has(full)
      ) {
        seen.add(full);
      }
    });
  }

  return [...seen];
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

  const title = $("p.product-title").first().text().trim();
  const artist = $("p.artist-name").first().text().trim();

  // Description: h2 teaser + body paragraphs in .col.text-intro
  let description = "";
  const $intro = $(".col.text-intro").first();
  if ($intro.length) {
    const parts: string[] = [];
    $intro.find("h2, p").each((_, el) => {
      const text = $(el).text().trim();
      if (text) parts.push(text);
    });
    description = parts.join("\n").trim();
  }

  // Images — desktop stacked images (not mobile swiper duplicates)
  const imageUrls: string[] = [];
  $(".d-none.d-lg-block img.attachment-super-large").each((_, el) => {
    const src = $(el).attr("src");
    if (src && !src.startsWith("data:") && !imageUrls.includes(src)) {
      imageUrls.push(src);
    }
  });
  const coverUrl = imageUrls[0] ?? "";
  const images = imageUrls.slice(1).join("|");

  // Availability from .stock-icon text node
  const stockRaw = $(".stock-icon").first().text().trim().toLowerCase();
  let availability: string;
  if (stockRaw.includes("pre-order") || stockRaw.includes("pre order")) {
    availability = "pre_order";
  } else if (stockRaw.includes("out of stock")) {
    availability = "sold_out";
  } else if (stockRaw.includes("last copies")) {
    availability = "available";
  } else if (stockRaw.includes("in stock")) {
    availability = "available";
  } else {
    // Fallback: if no add-to-cart button present, treat as sold out
    availability = $("a.ajax_add_to_cart, .single_add_to_cart_button").length
      ? "available"
      : "sold_out";
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
    process.argv[2] ?? join(process.cwd(), "output", "cc.csv");

  console.log("Collecting book URLs from listing pages...");
  const bookUrls = await getBookUrls();
  console.log(`Found ${bookUrls.length} book URLs.`);

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
