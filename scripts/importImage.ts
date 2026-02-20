import sharp from "sharp";
import { uploadImageFromBuffer } from "../src/services/storage";
import { MAX_GALLERY_SIZE_BYTES } from "../src/constants/images";

const COVER_MAX = 1200;
const GALLERY_MAX = 1600; // tightened from 1920
const COVER_QUALITY = 80;
const GALLERY_QUALITY_INITIAL = 75;

/** Encode to WebP; if over maxBytes, try lower quality until under. */
async function webpToMaxSize(
  sharpInstance: sharp.Sharp,
  maxBytes: number,
  initialQuality: number,
): Promise<Buffer> {
  const qualities = [initialQuality, 65, 55, 45];
  for (const q of qualities) {
    const out = await sharpInstance.webp({ quality: q }).toBuffer();
    if (out.length <= maxBytes) return out;
  }
  return sharpInstance.webp({ quality: 40 }).toBuffer();
}

export async function downloadAndUploadImage(
  imageUrl: string,
  folder: string,
  kind: "cover" | "gallery",
): Promise<string | null> {
  try {
    const res = await fetch(imageUrl, { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());

    const max = kind === "cover" ? COVER_MAX : GALLERY_MAX;
    const pipeline = sharp(buf).resize(max, max, {
      fit: "inside",
      withoutEnlargement: true,
    });

    const out =
      kind === "cover"
        ? await pipeline.webp({ quality: COVER_QUALITY }).toBuffer()
        : await webpToMaxSize(
            pipeline,
            MAX_GALLERY_SIZE_BYTES,
            GALLERY_QUALITY_INITIAL,
          );

    const result = await uploadImageFromBuffer(out, folder, {
      contentType: "image/webp",
      extension: "webp",
    });
    return result.url;
  } catch {
    return null;
  }
}
