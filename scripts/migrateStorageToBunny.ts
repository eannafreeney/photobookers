import "./env";
import postgres from "postgres";
import { bunnyPublicUrl, bunnyUpload } from "../src/lib/bunny";

// Migrate image objects + DB URLs from Supabase Storage to Bunny.
//
// Runs in three modes (MIGRATE_MODE, default "report"):
//   report  — count objects to copy and rows to rewrite; write nothing.
//   copy    — copy objects to Bunny at identical paths; leave the DB untouched
//             (site keeps serving from Supabase, safe to verify on Bunny first).
//   apply   — copy, then prefix-swap every image URL column to the Bunny CDN.
//
// Targeting comes from the loaded env (ENV=production overrides via .env.scripts
// → .env.production). It prints exactly what it will touch before doing anything.
//
//   MIGRATE_MODE=report  npx tsx scripts/migrateStorageToBunny.ts
//   MIGRATE_MODE=copy    npx tsx scripts/migrateStorageToBunny.ts
//   MIGRATE_MODE=apply   npx tsx scripts/migrateStorageToBunny.ts

type Mode = "report" | "copy" | "apply" | "revert";
const MODE = (process.env.MIGRATE_MODE ?? "report") as Mode;
const CONCURRENCY = 4;
const FETCH_TIMEOUT_MS = 60_000;
const MAX_ATTEMPTS = 4;

// (table, column) pairs that hold Supabase image URLs. The oldPrefix LIKE guard
// means non-bucket URLs (external links) are skipped automatically, so listing a
// column that sometimes holds foreign URLs is safe.
const SCALAR_COLUMNS: Array<{ table: string; column: string }> = [
  { table: "users", column: "profile_image_url" },
  { table: "creator_interviews", column: "promo_image_url" },
  { table: "creators", column: "cover_url" },
  { table: "creators", column: "banner_url" },
  { table: "books", column: "cover_url" },
  { table: "creator_messages", column: "image_url" },
  { table: "book_images", column: "image_url" },
  { table: "book_of_the_day", column: "featured_image_url" },
  { table: "artist_of_the_week", column: "featured_image_url" },
  { table: "publisher_of_the_week", column: "featured_image_url" },
  { table: "book_fairs", column: "cover_url" },
  { table: "book_fairs", column: "banner_url" },
  { table: "book_stores", column: "cover_url" },
  { table: "book_stores", column: "banner_url" },
  { table: "magazine_issues", column: "cover_url" },
  { table: "magazine_issues", column: "banner_url" },
  { table: "magazine_issue_books", column: "selected_image_url" },
];

const ARRAY_COLUMNS: Array<{ table: string; column: string }> = [
  { table: "book_of_the_day", column: "instagram_image_urls" },
  { table: "artist_of_the_week", column: "instagram_image_urls" },
  { table: "publisher_of_the_week", column: "instagram_image_urls" },
];

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

function contentTypeFromPath(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    webp: "image/webp",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    avif: "image/avif",
    svg: "image/svg+xml",
  };
  return map[ext] ?? "application/octet-stream";
}

async function mapPool<T>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<void>,
): Promise<void> {
  let cursor = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      await worker(items[index], index);
    }
  });
  await Promise.all(runners);
}

// Prefix-swap every image URL column: replace `from` with `to` where it matches
// `likePattern`. Used forward (apply: Supabase→Bunny) and backward (revert).
async function rewriteUrls(
  sql: postgres.Sql,
  from: string,
  to: string,
  likePattern: string,
): Promise<number> {
  let rowsChanged = 0;
  for (const { table, column } of SCALAR_COLUMNS) {
    const result = await sql.unsafe(
      `UPDATE ${table} SET ${column} = replace(${column}, $1, $2) WHERE ${column} LIKE $3`,
      [from, to, likePattern],
    );
    rowsChanged += result.count;
    console.log(`  ${table}.${column}: ${result.count}`);
  }
  for (const { table, column } of ARRAY_COLUMNS) {
    const result = await sql.unsafe(
      `UPDATE ${table} SET ${column} = (
         SELECT array_agg(replace(elem, $1, $2) ORDER BY ord)
         FROM unnest(${column}) WITH ORDINALITY AS t(elem, ord)
       ) WHERE array_to_string(${column}, ',') LIKE $3`,
      [from, to, likePattern],
    );
    rowsChanged += result.count;
    console.log(`  ${table}.${column} (array): ${result.count}`);
  }
  return rowsChanged;
}

async function main() {
  if (!["report", "copy", "apply", "revert"].includes(MODE)) {
    throw new Error(`MIGRATE_MODE must be report|copy|apply|revert (got "${MODE}")`);
  }

  // Target selection. Default (unset) uses the loaded DATABASE_URL/SUPABASE_URL,
  // which is production here — so staging must be requested explicitly.
  //   MIGRATE_TARGET=staging   → STAGING_DATABASE_URL / STAGING_SUPABASE_URL
  const target = process.env.MIGRATE_TARGET;
  const databaseUrl =
    target === "staging"
      ? requireEnv("STAGING_DATABASE_URL")
      : requireEnv("DATABASE_URL");
  const supabaseUrl = (
    target === "staging"
      ? requireEnv("STAGING_SUPABASE_URL")
      : requireEnv("SUPABASE_URL")
  ).replace(/\/+$/, "");
  const projectRef = new URL(supabaseUrl).hostname.split(".")[0];
  const oldPrefix = `${supabaseUrl}/storage/v1/object/public/images/`;
  const newPrefix = `${requireEnv("BUNNY_CDN_BASE").replace(/\/+$/, "")}/`;
  const likePattern = `${oldPrefix}%`;

  // Fail fast if Bunny env is incomplete (bunnyPublicUrl/bunnyUpload need these).
  requireEnv("BUNNY_STORAGE_HOST");
  requireEnv("BUNNY_STORAGE_ZONE");
  requireEnv("BUNNY_STORAGE_KEY");

  console.log("Storage migration — Supabase → Bunny");
  console.log(`  mode:      ${MODE}`);
  console.log(`  target:    ${target ?? "default (DATABASE_URL/SUPABASE_URL)"}`);
  console.log(`  project:   ${projectRef}`);
  console.log(`  database:  ${new URL(databaseUrl).host}`);
  console.log(`  from:      ${oldPrefix}`);
  console.log(`  to:        ${newPrefix}`);
  console.log(`  zone:      ${process.env.BUNNY_STORAGE_ZONE}\n`);

  // Safety: writing modes require echoing back the exact Supabase project ref, so
  // a stray env pointing at production can never be migrated by accident.
  if (MODE !== "report" && process.env.MIGRATE_CONFIRM !== projectRef) {
    throw new Error(
      `Refusing to run "${MODE}" against project "${projectRef}" without confirmation.\n` +
        `If that is the intended target, re-run with MIGRATE_CONFIRM=${projectRef}`,
    );
  }

  const sql = postgres(databaseUrl, { max: 1, prepare: false });

  try {
    // Gather every distinct Supabase bucket URL referenced across all columns.
    const selects = [
      ...SCALAR_COLUMNS.map(
        ({ table, column }) =>
          `SELECT ${column} AS url FROM ${table} WHERE ${column} LIKE $1`,
      ),
      ...ARRAY_COLUMNS.map(
        ({ table, column }) =>
          `SELECT unnest(${column}) AS url FROM ${table} WHERE array_to_string(${column}, ',') LIKE $1`,
      ),
    ];
    const gatherSql = `SELECT DISTINCT url FROM (\n${selects.join("\nUNION ALL\n")}\n) t WHERE url LIKE $1`;
    const urlRows = await sql.unsafe<{ url: string }[]>(gatherSql, [likePattern]);
    const paths = urlRows.map((r) => r.url.slice(oldPrefix.length));
    console.log(`Found ${paths.length} distinct objects referenced in the DB.\n`);

    if (MODE === "copy" || MODE === "apply") {
      let copied = 0;
      let skipped = 0;
      let missing = 0;
      let failed = 0;
      await mapPool(paths, CONCURRENCY, async (path, i) => {
        // Skip if already present on Bunny (idempotent re-runs). A transient HEAD
        // failure just means we fall through and (re)upload, which is safe.
        const head = await fetch(bunnyPublicUrl(path), { method: "HEAD" }).catch(
          () => null,
        );
        if (head?.ok) {
          skipped++;
          return;
        }

        // Retry transient network/timeout errors with backoff before giving up.
        for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
          try {
            const res = await fetch(oldPrefix + path, {
              signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
            });
            if (!res.ok) {
              if (res.status === 404) {
                // Dead DB reference (object already deleted) — skip, don't fail.
                missing++;
                console.warn(`  [${i + 1}] source 404: ${path}`);
                return;
              }
              throw new Error(`source ${res.status}`);
            }
            const buf = Buffer.from(await res.arrayBuffer());
            await bunnyUpload(path, buf, contentTypeFromPath(path));
            copied++;
            if (copied % 50 === 0) console.log(`  copied ${copied}...`);
            return;
          } catch (e) {
            if (attempt === MAX_ATTEMPTS) {
              failed++;
              console.warn(
                `  [${i + 1}] failed after ${attempt} attempts: ${path}: ${e instanceof Error ? e.message : e}`,
              );
              return;
            }
            await new Promise((r) => setTimeout(r, attempt * 750));
          }
        }
      });
      console.log(
        `\nCopy done. copied: ${copied}, already-present: ${skipped}, missing-source: ${missing}, failed: ${failed}.\n`,
      );
      if (failed > 0) {
        throw new Error("Some objects failed to upload — not proceeding to DB rewrite.");
      }
    }

    if (MODE === "apply") {
      console.log("Rewriting DB URLs (Supabase → Bunny)...");
      const rows = await rewriteUrls(sql, oldPrefix, newPrefix, likePattern);
      console.log(`\nApply done. Rows rewritten: ${rows}.`);
    }

    if (MODE === "revert") {
      // Roll back apply: swap Bunny URLs back to Supabase. Safe as long as the
      // Supabase bucket still holds the objects (i.e. before you empty it).
      console.log("Reverting DB URLs (Bunny → Supabase)...");
      const rows = await rewriteUrls(sql, newPrefix, oldPrefix, `${newPrefix}%`);
      console.log(`\nRevert done. Rows reverted: ${rows}.`);
    }

    if (MODE === "report") {
      console.log("Report only — no objects copied, no rows changed.");
      console.log('Next: MIGRATE_MODE=copy to populate Bunny, then MIGRATE_MODE=apply.');
    }
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
