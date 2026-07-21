import imageCompression from "browser-image-compression";

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
