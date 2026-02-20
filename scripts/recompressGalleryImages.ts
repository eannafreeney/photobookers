import "./env";
import sharp from "sharp";
import { db } from "../src/db/client";
import { bookImages } from "../src/db/schema";
import { overwriteImageAtPath } from "../src/services/storage";
import { MAX_GALLERY_SIZE_BYTES } from "../src/constants/images";

const BUCKET_PREFIX = "/storage/v1/object/public/images/";
const GALLERY_MAX_DIMENSION = 1600;
const DELAY_MS = 300;

const DRY_RUN = false; // set to false to actually overwrite

function getStoragePathFromPublicUrl(publicUrl: string): string | null {
  const idx = publicUrl.indexOf(BUCKET_PREFIX);
  if (idx === -1) return null;
  return publicUrl.slice(idx + BUCKET_PREFIX.length);
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Compress to WebP; reduce quality until under max bytes. */
async function compressToMaxSize(
  buffer: Buffer,
  maxBytes: number,
  maxDimension: number,
): Promise<Buffer> {
  let out = await sharp(buffer)
    .resize(maxDimension, maxDimension, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 80 })
    .toBuffer();

  if (out.length <= maxBytes) return out;

  for (const quality of [70, 60, 50, 40]) {
    out = await sharp(buffer)
      .resize(maxDimension, maxDimension, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality })
      .toBuffer();
    if (out.length <= maxBytes) return out;
  }

  return out;
}

async function main() {
  if (DRY_RUN) {
    console.log("DRY RUN — no storage overwrites will be made.\n");
  }

  const rows = await db
    .select({ id: bookImages.id, imageUrl: bookImages.imageUrl })
    .from(bookImages);

  let processed = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const path = getStoragePathFromPublicUrl(row.imageUrl);

    if (!path) {
      console.log(`[${i + 1}/${rows.length}] Skip (not our bucket): ${row.id}`);
      skipped++;
      continue;
    }

    try {
      const res = await fetch(row.imageUrl, {
        signal: AbortSignal.timeout(20_000),
      });
      if (!res.ok) {
        console.log(
          `[${i + 1}/${rows.length}] Skip (fetch ${res.status}): ${row.id}`,
        );
        skipped++;
        continue;
      }

      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length <= MAX_GALLERY_SIZE_BYTES) {
        console.log(
          `[${i + 1}/${rows.length}] Skip (already ${(buf.length / 1024).toFixed(1)} KB): ${row.id}`,
        );
        skipped++;
        continue;
      }

      const compressed = await compressToMaxSize(
        buf,
        MAX_GALLERY_SIZE_BYTES,
        GALLERY_MAX_DIMENSION,
      );

      if (DRY_RUN) {
        console.log(
          `[${i + 1}/${rows.length}] Would recompress: ${row.id} ${(buf.length / 1024).toFixed(1)} KB → ${(compressed.length / 1024).toFixed(1)} KB`,
        );
      } else {
        await overwriteImageAtPath(compressed, path);
        console.log(
          `[${i + 1}/${rows.length}] Recompressed: ${row.id} ${(buf.length / 1024).toFixed(1)} KB → ${(compressed.length / 1024).toFixed(1)} KB`,
        );
      }
      processed++;
    } catch (e) {
      console.error(`[${i + 1}/${rows.length}] Error ${row.id}:`, e);
      errors++;
    }

    await sleep(DELAY_MS);
  }

  console.log(
    `\nDone. Processed: ${processed}, skipped: ${skipped}, errors: ${errors}.`,
  );
  if (DRY_RUN) {
    console.log("Set DRY_RUN = false to perform overwrites.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
