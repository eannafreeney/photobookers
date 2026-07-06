import imageCompression from "browser-image-compression";
const presets = {
  cover: { maxSizeMB: 0.5, maxWidthOrHeight: 1200 },
  // Book covers
  gallery: { maxSizeMB: 0.8, maxWidthOrHeight: 1920 },
  // Gallery images
  profile: { maxSizeMB: 0.3, maxWidthOrHeight: 800 }
  // Creator photos
};
async function compressImage(file, preset) {
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
