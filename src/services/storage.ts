import { db } from "../db/client";
import { bookImages } from "../db/schema";
import {
  supabaseAdmin,
  supabaseStorage,
  supabaseStorageAdmin,
} from "../lib/supabase";
import sharp from "sharp";
import { MAX_GALLERY_SIZE_BYTES } from "../constants/images";

export type UploadKind = "cover" | "gallery";
const COVER_MAX_DIMENSION = 1200;
const GALLERY_MAX_DIMENSION = 1600;
const COVER_QUALITY = 80;
const GALLERY_QUALITIES = [75, 65, 55, 45];

async function encodeWebpToTarget(
  input: Buffer,
  kind: UploadKind,
): Promise<Buffer> {
  const maxDim = kind === "cover" ? COVER_MAX_DIMENSION : GALLERY_MAX_DIMENSION;
  const base = sharp(input).resize(maxDim, maxDim, {
    fit: "inside",
    withoutEnlargement: true,
  });
  if (kind === "cover") {
    return base.webp({ quality: COVER_QUALITY }).toBuffer();
  }
  for (const q of GALLERY_QUALITIES) {
    const out = await base.clone().webp({ quality: q }).toBuffer();
    if (out.length <= MAX_GALLERY_SIZE_BYTES) return out;
  }
  return base.webp({ quality: 40 }).toBuffer();
}

export async function compressImageBuffer(
  input: Buffer,
  kind: UploadKind,
): Promise<Buffer> {
  return encodeWebpToTarget(input, kind);
}

const BUCKET_NAME = "images";

type UploadResult = {
  url: string;
  path: string;
};

/**
 * Upload a file to Supabase Storage
 * @param file - The file to upload (from form data)
 * @param folder - Folder path (e.g., "books", "creators")
 * @returns The public URL and storage path
 */
export async function uploadImage(
  file: File,
  folder: string,
  kind: UploadKind,
): Promise<UploadResult> {
  // Generate unique filename
  const timestamp = Date.now();
  const fileName = `${timestamp}-${Math.random().toString(36).substring(7)}.webp`;
  const filePath = `${folder}/${fileName}`;

  const arrayBuffer = await file.arrayBuffer();
  const input = Buffer.from(arrayBuffer);
  const output = await encodeWebpToTarget(input, kind);

  // Upload to Supabase Storage
  const { data, error } = await supabaseStorageAdmin.storage
    .from(BUCKET_NAME)
    .upload(filePath, output, {
      contentType: "image/webp",
      upsert: false,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabaseStorage.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return {
    url: urlData.publicUrl,
    path: filePath,
  };
}

/**
 * Upload from a Buffer (for Node/scripts: import, etc.)
 */
export async function uploadImageFromBuffer(
  buffer: Buffer,
  folder: string,
  options: { contentType?: string; extension?: string } = {},
): Promise<UploadResult> {
  const { contentType = "image/webp", extension = "webp" } = options;
  const timestamp = Date.now();
  const fileName = `${timestamp}-${Math.random().toString(36).substring(7)}.${extension}`;
  const filePath = `${folder}/${fileName}`;

  const { error } = await supabaseStorageAdmin.storage
    .from(BUCKET_NAME)
    .upload(filePath, buffer, {
      contentType,
      upsert: false,
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data: urlData } = supabaseStorage.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return { url: urlData.publicUrl, path: filePath };
}

/**
 * Overwrite an existing file in storage (e.g. for re-compressing in place).
 * Uses upsert: true so the object at path is replaced.
 */
export async function overwriteImageAtPath(
  buffer: Buffer,
  path: string,
  contentType: string = "image/webp",
): Promise<void> {
  const { error } = await supabaseStorageAdmin.storage
    .from(BUCKET_NAME)
    .upload(path, buffer, { contentType, upsert: true });

  if (error) throw new Error(`Overwrite failed: ${error.message}`);
}

/**
 * Upload multiple images
 */
export async function uploadImages(
  imageFiles: File[],
  newBookId: string,
): Promise<void> {
  if (imageFiles.length > 0) {
    const uploadResults = await Promise.all(
      imageFiles.map((file) =>
        uploadImage(file, `books/${newBookId}/gallery`, "gallery"),
      ),
    );

    // Save to database
    await Promise.all(
      uploadResults.map((result, index) =>
        db.insert(bookImages).values({
          bookId: newBookId,
          imageUrl: result.url,
          sortOrder: index,
        }),
      ),
    );
  }
}

/**
 * Delete an image from storage
 */
export async function deleteImage(path: string): Promise<void> {
  const { error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .remove([path]);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
}

export async function uploadCoverImage(
  file: unknown,
  folder: string,
): Promise<string | null> {
  console.log(file, "file in UploadCoverImage");
  // Check for file-like object instead of instanceof File
  const isFile =
    file &&
    typeof file === "object" &&
    "name" in file &&
    "type" in file &&
    "size" in file;

  if (!isFile) {
    throw new Error("Cover image is required");
  }

  const result = await uploadImage(file as File, folder, "cover");
  return result.url;
}

export const removeInvalidImages = (f: unknown): f is File => {
  if (!f || typeof f !== "object") return false;
  if (!("name" in f) || !("size" in f) || !("type" in f)) return false;

  const file = f as File;

  // Reject empty files
  if (file.size === 0) return false;

  // Reject files with invalid names
  if (!file.name || file.name === "undefined" || file.name.trim() === "")
    return false;

  // Reject non-image files
  if (!file.type.startsWith("image/")) return false;

  return true;
};
