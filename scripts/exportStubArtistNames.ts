// import "dotenv/config";
import "./env";
import { and, asc, eq } from "drizzle-orm";
import { db, client } from "../src/db/client";
import { books, creators } from "../src/db/schema";
import fs from "node:fs/promises";

type Row = {
  artist_name: string;
  book_name: string;
  profile_url: string;
  publisher_name: string;
  publisher_profile_url: string;
};

const OUTPUT_PATH = "tmp/stub-artists.csv";

function normalizeName(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

function esc(v: string) {
  if (v.includes(",") || v.includes('"') || v.includes("\n")) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

async function run() {
  // Get all stub artists
  const artistRows = await db
    .select({
      id: creators.id,
      displayName: creators.displayName,
      slug: creators.slug,
    })
    .from(creators)
    .where(and(eq(creators.type, "artist"), eq(creators.status, "stub")))
    .orderBy(asc(creators.displayName));

  // Get one book per artist (first by title asc; adjust if you want newest)
  const out: Row[] = [];
  const seen = new Set<string>();

  for (const artist of artistRows) {
    const key = normalizeName(artist.displayName);
    if (seen.has(key)) continue;
    seen.add(key);

    const firstBook = await db.query.books.findFirst({
      where: eq(books.artistId, artist.id),
      columns: { title: true, publisherId: true },
      orderBy: (b, { asc }) => [asc(b.title)],
    });

    if (!firstBook?.title?.trim()) continue;

    let publisher_name = "";
    let publisher_profile_url = "";
    if (firstBook.publisherId) {
      const publisher = await db.query.creators.findFirst({
        where: eq(creators.id, firstBook.publisherId),
        columns: { displayName: true, slug: true },
      });
      if (publisher?.displayName?.trim()) {
        publisher_name = publisher.displayName.trim();
      }
      if (publisher?.slug) {
        publisher_profile_url = `https://photobookers.com/creators/${publisher.slug}`;
      }
    }

    out.push({
      artist_name: artist.displayName.trim(),
      book_name: firstBook.title.trim(),
      profile_url: `https://photobookers.com/creators/${artist.slug}`,
      publisher_name,
      publisher_profile_url,
    });
  }

  await fs.mkdir("tmp", { recursive: true });

  const lines = [
    "artist_name,book_name,profile_url,publisher_name,publisher_profile_url",
  ];
  for (const row of out) {
    lines.push(
      [
        esc(row.artist_name),
        esc(row.book_name),
        esc(row.profile_url),
        esc(row.publisher_name),
        esc(row.publisher_profile_url),
      ].join(","),
    );
  }

  await fs.writeFile(OUTPUT_PATH, lines.join("\n"), "utf8");
  console.log(`Wrote ${out.length} rows to ${OUTPUT_PATH}`);

  await client.end();
}

run().catch(async (err) => {
  console.error(err);
  try {
    await client.end();
  } catch {}
  process.exit(1);
});
