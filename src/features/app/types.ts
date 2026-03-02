import { Book, Creator } from "../../db/schema";

export type BookWithGalleryImages = Omit<
  Book & { artist: Creator | null; publisher: Creator | null },
  "images"
> & {
  images: { imageUrl: string }[];
};

export const BookCard = {};
