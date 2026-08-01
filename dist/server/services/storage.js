import { db } from "../db/client.js";
import { bookImages } from "../db/schema.js";
import {
  supabaseAdmin,
  supabaseStorage,
  supabaseStorageAdmin
} from "../lib/supabase.js";
import {
  bunnyDelete,
  bunnyEnabled,
  bunnyPublicUrl,
  bunnyUpload
} from "../lib/bunny.js";
import { MAX_GALLERY_SIZE_BYTES } from "../constants/images.js";
const COVER_MAX_DIMENSION = 1600;
const GALLERY_MAX_DIMENSION = 2048;
const COVER_QUALITY = 90;
const GALLERY_QUALITIES = [92, 88, 84];
async function encodeWebpToTarget(input, kind) {
  const { default: sharp } = await import("sharp");
  const maxDim = kind === "cover" ? COVER_MAX_DIMENSION : GALLERY_MAX_DIMENSION;
  const base = sharp(input).resize(maxDim, maxDim, {
    fit: "inside",
    withoutEnlargement: true
  });
  if (kind === "cover") {
    return base.webp({ quality: COVER_QUALITY }).toBuffer();
  }
  for (const q of GALLERY_QUALITIES) {
    const out = await base.clone().webp({ quality: q }).toBuffer();
    if (out.length <= MAX_GALLERY_SIZE_BYTES) return out;
  }
  return base.webp({ quality: 82 }).toBuffer();
}
async function compressImageBuffer(input, kind) {
  return encodeWebpToTarget(input, kind);
}
const BUCKET_NAME = "images";
async function putObject(path, body, contentType, upsert) {
  if (bunnyEnabled()) {
    await bunnyUpload(path, body, contentType);
    return;
  }
  const { error } = await supabaseStorageAdmin.storage.from(BUCKET_NAME).upload(path, body, { contentType, upsert });
  if (error) throw new Error(`Upload failed: ${error.message}`);
}
function publicUrlForPath(path) {
  if (bunnyEnabled()) return bunnyPublicUrl(path);
  return supabaseStorage.storage.from(BUCKET_NAME).getPublicUrl(path).data.publicUrl;
}
async function removeObject(path) {
  if (bunnyEnabled()) {
    await bunnyDelete(path);
    return;
  }
  const { error } = await supabaseAdmin.storage.from(BUCKET_NAME).remove([path]);
  if (error) throw new Error(`Delete failed: ${error.message}`);
}
async function uploadImage(file, folder, kind) {
  const timestamp = Date.now();
  const fileName = `${timestamp}-${Math.random().toString(36).substring(7)}.webp`;
  const filePath = `${folder}/${fileName}`;
  const arrayBuffer = await file.arrayBuffer();
  const input = Buffer.from(arrayBuffer);
  const output = await encodeWebpToTarget(input, kind);
  await putObject(filePath, output, "image/webp", false);
  return {
    url: publicUrlForPath(filePath),
    path: filePath
  };
}
async function uploadImageFromBuffer(buffer, folder, options = {}) {
  const { contentType = "image/webp", extension = "webp" } = options;
  const timestamp = Date.now();
  const fileName = `${timestamp}-${Math.random().toString(36).substring(7)}.${extension}`;
  const filePath = `${folder}/${fileName}`;
  await putObject(filePath, buffer, contentType, false);
  return { url: publicUrlForPath(filePath), path: filePath };
}
async function overwriteImageAtPath(buffer, path, contentType = "image/webp") {
  await putObject(path, buffer, contentType, true);
}
async function uploadImages(imageFiles, newBookId) {
  if (imageFiles.length === 0) return;
  const uploadResults = [];
  for (const file of imageFiles) {
    uploadResults.push(
      await uploadImage(file, `books/${newBookId}/gallery`, "gallery")
    );
  }
  await Promise.all(
    uploadResults.map(
      (result, index) => db.insert(bookImages).values({
        bookId: newBookId,
        imageUrl: result.url,
        sortOrder: index
      })
    )
  );
}
async function deleteImage(path) {
  await removeObject(path);
}
async function uploadCoverImage(file, folder) {
  console.log(file, "file in UploadCoverImage");
  const isFile = file && typeof file === "object" && "name" in file && "type" in file && "size" in file;
  if (!isFile) {
    throw new Error("Cover image is required");
  }
  const result = await uploadImage(file, folder, "cover");
  return result.url;
}
const removeInvalidImages = (f) => {
  if (!f || typeof f !== "object") return false;
  if (!("name" in f) || !("size" in f) || !("type" in f)) return false;
  const file = f;
  if (file.size === 0) return false;
  if (!file.name || file.name === "undefined" || file.name.trim() === "")
    return false;
  if (!file.type.startsWith("image/")) return false;
  return true;
};
export {
  compressImageBuffer,
  deleteImage,
  overwriteImageAtPath,
  removeInvalidImages,
  uploadCoverImage,
  uploadImage,
  uploadImageFromBuffer,
  uploadImages
};
