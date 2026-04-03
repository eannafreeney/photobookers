import "./env";
import { join } from "path";
import { eq, isNotNull } from "drizzle-orm";
import { db } from "../src/db/client";
import { mkdirSync, writeFileSync } from "fs";
import { books } from "../src/db/schema";
import {
  compressImageBuffer,
  deleteImage,
  uploadImageFromBuffer,
} from "../src/services/storage";

const BUCKET_PREFIX = "/storage/v1/object/public/images/";
const DELAY_MS = 300;
const DRY_RUN = false;
const EXPORT_SUSPECT_IMAGES = true;
const MIN_ORIGINAL_BYTES = 200 * 1024;
const MIN_SHRINK_RATIO = 2;

const SUSPECT_SHRINK_RATIO = 10;
const SUSPECT_ORIGINAL_MIN_BYTES = 1024 * 1024;
const SUSPECT_LARGE_ORIGINAL_SMALL_OUTPUT_BYTES = 500 * 1024;
const SUSPECT_COMPRESSED_MAX_BYTES = 25 * 1024;

const WRITE_BACKUP_CSV = true;
const FETCH_TIMEOUT_MS = 60_000;

function extensionFromPath(pathOrUrl: string): string {
  const base = pathOrUrl.split("/").pop() ?? "";
  const m = base.match(/\.([a-zA-Z0-9]+)$/);
  if (!m) return ".bin";
  const ext = m[1].toLowerCase();
  if (["jpg", "jpeg", "png", "webp", "gif", "avif"].includes(ext)) {
    return `.${ext === "jpeg" ? "jpg" : ext}`;
  }
  return `.${ext}`;
}

function shouldRecompress(
  originalBytes: number,
  compressedBytes: number,
): boolean {
  if (originalBytes > MIN_ORIGINAL_BYTES) return true;
  if (compressedBytes === 0) return true;
  return originalBytes / compressedBytes > MIN_SHRINK_RATIO;
}

function isSuspectForReview(
  originalBytes: number,
  compressedBytes: number,
): boolean {
  if (compressedBytes === 0) return true;
  const ratio = originalBytes / compressedBytes;
  if (ratio >= SUSPECT_SHRINK_RATIO) return true;
  if (originalBytes >= SUSPECT_ORIGINAL_MIN_BYTES) return true;
  if (
    originalBytes > SUSPECT_LARGE_ORIGINAL_SMALL_OUTPUT_BYTES &&
    compressedBytes < SUSPECT_COMPRESSED_MAX_BYTES
  ) {
    return true;
  }
  return false;
}

function csvEscape(s: string): string {
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function getStoragePathFromPublicUrl(publicUrl: string): string | null {
  const idx = publicUrl.indexOf(BUCKET_PREFIX);
  if (idx === -1) return null;
  return publicUrl.slice(idx + BUCKET_PREFIX.length);
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

type SuspectRow = {
  id: string;
  coverUrl: string;
  originalKb: number;
  compressedKb: number;
  ratio: number;
  oldPath: string;
};

async function main() {
  if (DRY_RUN) {
    console.log("DRY RUN — no uploads, DB updates, or deletes.\n");
  }

  const rows = await db
    .select({ id: books.id, coverUrl: books.coverUrl })
    .from(books)
    .where(isNotNull(books.coverUrl));

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");

  let suspectExportDir: string | null = null;
  if (EXPORT_SUSPECT_IMAGES && DRY_RUN) {
    suspectExportDir = join(
      process.cwd(),
      "scripts",
      `suspect-review-${stamp}`,
    );
    mkdirSync(suspectExportDir, { recursive: true });
    console.log(`Suspect images will be saved under:\n${suspectExportDir}\n`);
  }

  if (WRITE_BACKUP_CSV && rows.length > 0) {
    const backupPath = join(
      process.cwd(),
      "scripts",
      `cover-url-backup-${stamp}.csv`,
    );
    const lines = [
      "id,cover_url",
      ...rows.map((r) => `${r.id},${csvEscape(r.coverUrl!)}`),
    ];
    writeFileSync(backupPath, lines.join("\n"), "utf8");
    console.log(`Wrote backup CSV (${rows.length} rows): ${backupPath}\n`);
  }

  let processed = 0;
  let skipped = 0;
  let skippedBelowThreshold = 0;
  let errors = 0;
  const suspectRows: SuspectRow[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const coverUrl = row.coverUrl!;
    const oldPath = getStoragePathFromPublicUrl(coverUrl);

    if (!oldPath) {
      console.log(`[${i + 1}/${rows.length}] Skip (not our bucket): ${row.id}`);
      skipped++;
      continue;
    }

    try {
      const res = await fetch(coverUrl, {
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      if (!res.ok) {
        console.log(
          `[${i + 1}/${rows.length}] Skip (fetch ${res.status}): ${row.id}`,
        );
        skipped++;
        continue;
      }

      const buf = Buffer.from(await res.arrayBuffer());
      const compressed = await compressImageBuffer(buf, "cover");
      const folder = `books/covers/${row.id}`;

      if (!shouldRecompress(buf.length, compressed.length)) {
        skippedBelowThreshold++;
        await sleep(DELAY_MS);
        continue;
      }

      const ratio =
        compressed.length === 0 ? Infinity : buf.length / compressed.length;
      const ratioLabel = Number.isFinite(ratio) ? ratio.toFixed(2) : "inf";
      const suspect = isSuspectForReview(buf.length, compressed.length);

      if (suspect) {
        suspectRows.push({
          id: row.id,
          coverUrl,
          originalKb: buf.length / 1024,
          compressedKb: compressed.length / 1024,
          ratio: Number.isFinite(ratio) ? ratio : 0,
          oldPath,
        });
        if (suspectExportDir) {
          const origExt = extensionFromPath(oldPath);
          writeFileSync(
            join(suspectExportDir, `${row.id}-original${origExt}`),
            buf,
          );
          writeFileSync(
            join(suspectExportDir, `${row.id}-compressed.webp`),
            compressed,
          );
        }
      }

      const tag = suspect ? "⚠️ SUSPECT — visually verify — " : "";

      if (DRY_RUN) {
        console.log(
          `[${i + 1}/${rows.length}] ${tag}Would replace: ${row.id} ${(buf.length / 1024).toFixed(1)} KB → ${(compressed.length / 1024).toFixed(1)} KB (${ratioLabel}×) | old: ${oldPath}`,
        );
      } else {
        const { url: newUrl, path: newPath } = await uploadImageFromBuffer(
          compressed,
          folder,
          { contentType: "image/webp", extension: "webp" },
        );

        await db
          .update(books)
          .set({ coverUrl: newUrl })
          .where(eq(books.id, row.id));

        if (newPath !== oldPath) {
          try {
            await deleteImage(oldPath);
          } catch (e) {
            console.warn(
              `[${i + 1}/${rows.length}] New URL set but old delete failed (${oldPath}):`,
              e,
            );
          }
        }

        console.log(
          `[${i + 1}/${rows.length}] ${tag}Updated ${row.id}: ${(buf.length / 1024).toFixed(1)} KB → ${(compressed.length / 1024).toFixed(1)} KB (${ratioLabel}×)`,
        );
      }
      processed++;
    } catch (e) {
      console.error(`[${i + 1}/${rows.length}] Error ${row.id}:`, e);
      errors++;
    }

    await sleep(DELAY_MS);
  }

  if (suspectRows.length > 0) {
    const suspectPath = join(
      process.cwd(),
      "scripts",
      `cover-recompress-suspect-review-${stamp}.csv`,
    );
    const suspectLines = [
      "id,cover_url,original_kb,compressed_kb,shrink_ratio,storage_path",
      ...suspectRows.map((s) =>
        [
          s.id,
          csvEscape(s.coverUrl),
          s.originalKb.toFixed(1),
          s.compressedKb.toFixed(1),
          s.ratio.toFixed(2),
          csvEscape(s.oldPath),
        ].join(","),
      ),
    ];
    writeFileSync(suspectPath, suspectLines.join("\n"), "utf8");
    console.log(
      `\n⚠️ Suspect covers (${suspectRows.length}) — open URLs in a browser and compare before/after quality:`,
    );
    console.log(`   ${suspectPath}`);
  }

  console.log(
    `\nDone. Processed: ${processed}, skipped: ${skipped}, skipped (below ${MIN_ORIGINAL_BYTES / 1024} KB & ≤${MIN_SHRINK_RATIO}× shrink): ${skippedBelowThreshold}, errors: ${errors}.`,
  );
  if (DRY_RUN) {
    console.log(
      "Set DRY_RUN = false to upload, update books.coverUrl, and delete old objects.",
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
