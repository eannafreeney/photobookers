import { Env } from "hono/types";
import { Book, Creator } from "../../db/schema";
import { contactFormSchema } from "./schema";
import { Context } from "hono";
import { z } from "zod";

export type BookWithGalleryImages = Omit<
  Book & { artist: Creator | null; publisher: Creator | null },
  "images"
> & {
  images: { imageUrl: string }[];
};

export const BookCard = {};

export type ContactFormContext = Context<
  Env,
  string,
  { out: { form: z.infer<typeof contactFormSchema> } }
>;
