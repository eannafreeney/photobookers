import "dotenv/config";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, { max: 1 });

// Tighter night-specific matching (avoid broad words like "dark"/"evening" alone)
const rx = "\\mnight|nocturn|midnight|after dark|neon|nightfall|\\mdusk\\M|twilight|\\minsomni";

async function main() {
  // 1. Overall verified vs stub across whole published catalog (by artist creator)
  const split = await sql`
    SELECT
      count(*) FILTER (WHERE c.status = 'verified')::int AS verified,
      count(*) FILTER (WHERE c.status = 'stub')::int     AS stub,
      count(*) FILTER (WHERE b.artist_id IS NULL)::int   AS no_artist,
      count(*)::int AS total
    FROM books b
    LEFT JOIN creators c ON c.id = b.artist_id
    WHERE b.publication_status = 'published'`;
  console.log("WHOLE CATALOG (by artist creator):", split[0]);

  // 2. After Midnight shortlist with artist + status
  const rows = await sql`
    SELECT b.title, c.display_name AS artist, c.status AS artist_status
    FROM books b
    LEFT JOIN creators c ON c.id = b.artist_id
    WHERE b.publication_status = 'published'
      AND (
        b.title ~* ${rx}
        OR coalesce(b.description,'') ~* ${rx}
        OR EXISTS (SELECT 1 FROM unnest(coalesce(b.tags,'{}')) tg WHERE tg ~* ${rx})
      )
    ORDER BY (c.status = 'verified') DESC, b.title`;

  const verified = rows.filter((r) => r.artist_status === "verified");
  console.log(`\nAFTER MIDNIGHT — ${rows.length} tighter matches (${verified.length} by verified artists)\n`);
  for (const r of rows) {
    const badge = r.artist_status === "verified" ? "✅ VERIFIED" : r.artist_status === "stub" ? "· stub" : r.artist ? `· ${r.artist_status}` : "· (no artist)";
    console.log(`  ${badge.padEnd(12)} | ${r.title}${r.artist ? `  — ${r.artist}` : ""}`);
  }
  await sql.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
