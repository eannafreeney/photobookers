import { z } from "zod";
import { parseWeekString } from "../../../../lib/utils";
import { optionalText } from "../../../../schemas";

// ============ BOOK OF THE WEEK FORM SCHEMA ============
export const bookOfTheWeekFormSchema = z.object({
  weekStart: z
    .string()
    .min(1, "Week is required")
    .transform(parseWeekString)
    .refine((d) => !Number.isNaN(d.getTime()), "Invalid week"),
  bookId: z.string().min(1, "Book is required"),
  text: optionalText,
});

export const featuredBooksFormSchema = z
  .object({
    weekStart: z
      .string()
      .min(1, "Week is required")
      .transform(parseWeekString)
      .refine((d) => !Number.isNaN(d.getTime()), "Invalid week"),
    bookId1: z.string().min(1, "Book 1 required"),
    bookId2: z.string().min(1, "Book 2 required"),
    bookId3: z.string().min(1, "Book 3 required"),
    bookId4: z.string().min(1, "Book 4 required"),
    bookId5: z.string().min(1, "Book 5 required"),
  })
  .refine(
    (data) =>
      new Set([
        data.bookId1,
        data.bookId2,
        data.bookId3,
        data.bookId4,
        data.bookId5,
      ]).size === 5,
    { message: "Duplicate books not allowed" },
  );

export const artistOfTheWeekFormSchema = z.object({
  weekStart: z
    .string()
    .min(1, "Week is required")
    .transform(parseWeekString)
    .refine((d) => !Number.isNaN(d.getTime()), "Invalid week"),
  creatorId: z.string().min(1, "Artist is required"),
  text: z.string().max(400, "Text must be less than 400 characters"),
});

export const publisherOfTheWeekFormSchema = z.object({
  weekStart: z
    .string()
    .min(1, "Week is required")
    .transform(parseWeekString)
    .refine((d) => !Number.isNaN(d.getTime()), "Invalid week"),
  creatorId: z.string().min(1, "Publisher is required"),
  text: z.string().max(400, "Text must be less than 400 characters"),
});

export const weekQuerySchema = z.object({ week: z.string() });
