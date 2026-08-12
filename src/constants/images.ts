export const MAX_GALLERY_IMAGES_PER_BOOK = 10;
/** Max photos a store can submit via the outreach upload link. */
export const MAX_STORE_GALLERY_IMAGES = 5;
/** Server-side target cap for the final gallery webp (served from Bunny CDN).
 *  The server steps quality down only if a high-quality encode exceeds this. */
export const MAX_GALLERY_SIZE_BYTES = 3.5 * 1024 * 1024;
