import imageCompression from "browser-image-compression";

// Formats sharp can reliably decode server-side. HEIC (iPhone) is intentionally
// excluded so it still gets converted to webp in the browser.
const SERVER_ENCODABLE_TYPES = ["image/jpeg", "image/png", "image/webp"];

// At or under this size, a standard-format file skips the browser pass and is
// compressed once, server-side, for maximum sharpness. Must stay within the
// server upload cap (validateImageFile, 5MB).
const SKIP_BROWSER_COMPRESSION_BYTES = 5 * 1024 * 1024;

export type CompressionPreset = "cover" | "gallery" | "profile";

const presets: Record<
  CompressionPreset,
  { maxSizeMB: number; maxWidthOrHeight: number }
> = {
  // Light first pass (near-lossless) — kept under the 5MB upload cap. The server
  // does the authoritative compression, so the browser mainly normalizes format
  // (e.g. HEIC) and bounds dimensions.
  cover: { maxSizeMB: 4.5, maxWidthOrHeight: 1600 }, // Book covers
  gallery: { maxSizeMB: 4.5, maxWidthOrHeight: 2048 }, // Gallery images
  profile: { maxSizeMB: 2, maxWidthOrHeight: 1000 }, // Creator photos
};

export async function compressImage(
  file: File,
  preset: CompressionPreset
): Promise<File> {
  // Standard-format files already within the upload cap don't need a browser
  // pass. Uploading the original lets the server do a single, crisp encode
  // instead of browser-webp + server-webp double compression (which softens
  // detail). HEIC and oversized files still go through the browser below.
  if (
    SERVER_ENCODABLE_TYPES.includes(file.type) &&
    file.size <= SKIP_BROWSER_COMPRESSION_BYTES
  ) {
    return file;
  }

  const options = {
    ...presets[preset],
    useWebWorker: true,
    fileType: "image/webp" as const,
  };

  try {
    const compressedBlob = await imageCompression(file, options);

    // Convert blob back to File with .webp extension
    const newName = file.name.replace(/\.[^.]+$/, ".webp");
    return new File([compressedBlob], newName, { type: "image/webp" });
  } catch (error) {
    console.error("Compression failed, using original:", error);
    return file; // Fallback to original if compression fails
  }
}

export async function compressImages(
  files: File[],
  preset: CompressionPreset
): Promise<File[]> {
  return Promise.all(files.map((file) => compressImage(file, preset)));
}
