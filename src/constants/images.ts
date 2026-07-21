export const MAX_GALLERY_IMAGES_PER_BOOK = 10;
/** Server-side cap for gallery images; headroom above the client's 2 MB so the
 *  server rarely has to step quality down (images served from Bunny CDN). */
export const MAX_GALLERY_SIZE_BYTES = 2.5 * 1024 * 1024;
