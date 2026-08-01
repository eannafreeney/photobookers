import imageCompression from "browser-image-compression";
const SERVER_ENCODABLE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const SKIP_BROWSER_COMPRESSION_BYTES = 5 * 1024 * 1024;
const presets = {
  // Light first pass (near-lossless) — kept under the 5MB upload cap. The server
  // does the authoritative compression, so the browser mainly normalizes format
  // (e.g. HEIC) and bounds dimensions.
  cover: { maxSizeMB: 4.5, maxWidthOrHeight: 1600 },
  // Book covers
  gallery: { maxSizeMB: 4.5, maxWidthOrHeight: 2048 },
  // Gallery images
  profile: { maxSizeMB: 2, maxWidthOrHeight: 1e3 }
  // Creator photos
};
async function compressImage(file, preset) {
  if (SERVER_ENCODABLE_TYPES.includes(file.type) && file.size <= SKIP_BROWSER_COMPRESSION_BYTES) {
    return file;
  }
  const options = {
    ...presets[preset],
    useWebWorker: true,
    fileType: "image/webp"
  };
  try {
    const compressedBlob = await imageCompression(file, options);
    const newName = file.name.replace(/\.[^.]+$/, ".webp");
    return new File([compressedBlob], newName, { type: "image/webp" });
  } catch (error) {
    console.error("Compression failed, using original:", error);
    return file;
  }
}
async function compressImages(files, preset) {
  return Promise.all(files.map((file) => compressImage(file, preset)));
}
export {
  compressImage,
  compressImages
};
