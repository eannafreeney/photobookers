import sharp from "sharp";
import { uploadImageFromBuffer } from "../src/services/storage";

const COVER_MAX = 1200; // max width/height, similar to client "cover"
const GALLERY_MAX = 1920; // similar to client "gallery"
const WEBP_QUALITY = 80;

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
    const out = await sharp(buf)
      .resize(max, max, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();

    const result = await uploadImageFromBuffer(out, folder, {
      contentType: "image/webp",
      extension: "webp",
    });
    return result.url;
  } catch {
    return null;
  }
}
