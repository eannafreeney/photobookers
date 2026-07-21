import imageCompression from "browser-image-compression";

export type CompressionPreset = "cover" | "gallery" | "profile";

const presets: Record<
  CompressionPreset,
  { maxSizeMB: number; maxWidthOrHeight: number }
> = {
  cover: { maxSizeMB: 1.2, maxWidthOrHeight: 1600 }, // Book covers
  gallery: { maxSizeMB: 2, maxWidthOrHeight: 2048 }, // Gallery images
  profile: { maxSizeMB: 0.6, maxWidthOrHeight: 1000 }, // Creator photos
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
