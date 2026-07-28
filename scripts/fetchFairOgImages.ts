/**
 * Fetch og:image for each LensCulture fair website and write covers into
 * CSV + production DB (by slug). Instagram / blocked hosts are skipped.
 *
 *   ENV=production npx tsx scripts/fetchFairOgImages.ts
 */
import "./env";
import { writeFileSync } from "fs";
import { resolve } from "path";
import * as cheerio from "cheerio";
import { eq } from "drizzle-orm";
import { db } from "../src/db/client";
import { bookFairs } from "../src/db/schema";
import { FAIRS_FROM_LENSCULTURE } from "./data/fairsFromLensCulture";
import { escapeCsv, normalizeUrl } from "./scraperUtils";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800";

const SKIP_HOSTS = ["instagram.com", "www.instagram.com"];

function shouldSkip(website: string): boolean {
  try {
    const host = new URL(website).hostname.toLowerCase();
    return SKIP_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
  } catch {
    return true;
  }
}

async function fetchOgImage(website: string): Promise<string | null> {
  if (shouldSkip(website)) return null;
  try {
    const res = await fetch(website, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; PhotobookersBot/1.0; +https://photobookers.com)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    const $ = cheerio.load(html);
    const raw =
      $('meta[property="og:image"]').attr("content") ??
      $('meta[property="og:image:secure_url"]').attr("content") ??
      $('meta[name="twitter:image"]').attr("content") ??
      null;
    if (!raw?.trim()) return null;
    const absolute = normalizeUrl(raw.trim(), new URL(website).origin);
    if (absolute.startsWith("data:")) return null;
    return absolute;
  } catch {
    return null;
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const covers = new Map<string, string>();
  let found = 0;
  let missed = 0;

  console.log(`Fetching OG images for ${FAIRS_FROM_LENSCULTURE.length} fairs...\n`);

  for (const fair of FAIRS_FROM_LENSCULTURE) {
    const website = fair.website?.trim();
    if (!website) {
      console.log(`- ${fair.slug}: no website`);
      missed++;
      continue;
    }
    process.stdout.write(`- ${fair.slug} ... `);
    const og = await fetchOgImage(website);
    if (og) {
      covers.set(fair.slug, og);
      found++;
      console.log(`ok`);
    } else {
      missed++;
      console.log(`miss`);
    }
    await sleep(250);
  }

  // Update DB coverUrl where we found an image
  let updated = 0;
  for (const [slug, coverUrl] of covers) {
    const [row] = await db
      .update(bookFairs)
      .set({ coverUrl, updatedAt: new Date() })
      .where(eq(bookFairs.slug, slug))
      .returning({ slug: bookFairs.slug });
    if (row) updated++;
  }

  // Rewrite CSV with coverUrl column
  const headers = [
    "name",
    "slug",
    "city",
    "country",
    "venue",
    "website",
    "startDate",
    "endDate",
    "status",
    "coverUrl",
    "description",
  ];
  const lines = FAIRS_FROM_LENSCULTURE.map((f) => {
    const coverUrl = covers.get(f.slug) ?? PLACEHOLDER;
    return [
      f.name,
      f.slug,
      f.city,
      f.country,
      f.venue ?? "",
      f.website ?? "",
      f.startDate.toISOString().slice(0, 10),
      f.endDate.toISOString().slice(0, 10),
      f.status,
      coverUrl,
      f.description,
    ]
      .map((v) => escapeCsv(String(v)))
      .join(",");
  });
  const csvPath = resolve("scripts/data/fairsFromLensCulture.csv");
  writeFileSync(csvPath, [headers.join(","), ...lines].join("\n") + "\n");

  const mapPath = resolve("scripts/data/fairsFromLensCulture.covers.json");
  writeFileSync(
    mapPath,
    JSON.stringify(Object.fromEntries(covers), null, 2) + "\n",
  );

  console.log(`\nDone: ${found} images found, ${missed} missed`);
  console.log(`DB updated: ${updated}`);
  console.log(`CSV: ${csvPath}`);
  console.log(`Map: ${mapPath}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
