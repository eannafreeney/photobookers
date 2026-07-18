import { z } from "zod";
import type { BookPressLink } from "../../../db/schema";

export type { BookPressLink };

export const MAX_BOOK_PRESS_LINKS = 5;

export const bookPressLinkSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(120, "Title must be 120 characters or less"),
  url: z.string().trim().url("Enter a valid URL"),
  quote: z
    .string()
    .trim()
    .max(500, "Quote must be 500 characters or less")
    .optional()
    .nullable()
    .transform((v) => (v ? v : null)),
});

/** Accepts a JSON string from the form, an array, or absent/empty → undefined. */
export const pressLinksFormField = z.preprocess((value) => {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
}, z.array(bookPressLinkSchema).max(MAX_BOOK_PRESS_LINKS).optional());

export function serializePressLinks(
  links: BookPressLink[] | null | undefined,
): string {
  return JSON.stringify(links ?? []);
}
