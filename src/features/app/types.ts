import { Env } from "hono/types";
import { Book, Creator } from "../../db/schema";
import {
  contactFormSchema,
  slugSchema,
  tagSchema,
  userUpdateFormSchema,
} from "./schema";
import { Context } from "hono";
import { z } from "zod";
import { bookIdSchema } from "../../schemas";
import { commentIdSchema } from "../api/schema";

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

export type UserUpdateFormContext = Context<
  Env,
  string,
  { out: { form: z.infer<typeof userUpdateFormSchema> } }
>;

export type BookDetailContext = Context<
  Env,
  string,
  { out: { param: z.infer<typeof slugSchema> } }
>;

export type BookTagContext = Context<
  Env,
  string,
  { out: { param: z.infer<typeof tagSchema> } }
>;

export type UserUpdateModalContext = Context<
  Env,
  string,
  { out: { form: z.infer<typeof userUpdateFormSchema> } }
>;
