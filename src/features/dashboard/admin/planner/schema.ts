import { z } from "zod";
import { parseDateString, parseWeekString } from "../../../../lib/utils";

// ============ BOOK OF THE DAY FORM SCHEMA ============
export const bookOfTheDayFormSchema = z.object({
  date: z
    .string()
    .min(1, "Date is required")
    .transform(parseDateString)
    .refine((d) => !Number.isNaN(d.getTime()), "Invalid date"),
  bookId: z.string().min(1, "Book is required"),
});

export const sendBOTDCreatorEmailFormSchema = z.object({
  recipientType: z.enum(["artist", "publisher"]),
  creatorId: z.string().min(1, "Creator is required"),
  bookId: z.string().min(1, "Book is required"),
  date: z
    .string()
    .min(1, "Date is required")
    .transform(parseDateString)
    .refine((d) => !Number.isNaN(d.getTime()), "Invalid date"),
  emailKind: z.enum(["advance", "feature_day"]).default("advance"),
});

export const sendAOTWCreatorEmailFormSchema = z.object({
  creatorId: z.string().min(1, "Creator is required"),
  weekStart: z
    .string()
    .min(1, "Week is required")
    .transform(parseWeekString)
    .refine((d) => !Number.isNaN(d.getTime()), "Invalid week"),
  emailKind: z
    .enum(["advance", "interview_reminder", "feature_day"])
    .default("advance"),
});

export const sendPOTWCreatorEmailFormSchema = z.object({
  creatorId: z.string().min(1, "Creator is required"),
  weekStart: z
    .string()
    .min(1, "Week is required")
    .transform(parseWeekString)
    .refine((d) => !Number.isNaN(d.getTime()), "Invalid week"),
  emailKind: z
    .enum(["advance", "interview_reminder", "feature_day"])
    .default("advance"),
});

export const setEmailFormSchema = z.object({
  recipientType: z.preprocess(
    (val) => (val === "" || val === undefined ? null : val),
    z.enum(["artist", "publisher"]).nullable(),
  ),
  creatorId: z.string().min(1, "Creator is required"),
  email: z.string().min(1, "Email is required"),
  bookId: z.preprocess(
    (val) => (val === "" || val === undefined ? null : val),
    z.string().nullable(),
  ),
  /** Present when scheduling a BOTD email flow. */
  date: z
    .string()
    .optional()
    .transform((val) => (val ? parseDateString(val) : null))
    .refine(
      (d) => d === null || !Number.isNaN(d.getTime()),
      "Invalid date",
    ),
  /** Present when scheduling an AOTW/POTW email flow. */
  weekStart: z
    .string()
    .optional()
    .transform((val) => (val ? parseWeekString(val) : null))
    .refine(
      (d) => d === null || !Number.isNaN(d.getTime()),
      "Invalid week",
    ),
});

export const artistOfTheWeekFormSchema = z.object({
  weekStart: z
    .string()
    .min(1, "Week is required")
    .transform(parseWeekString)
    .refine((d) => !Number.isNaN(d.getTime()), "Invalid week"),
  creatorId: z.string().min(1, "Artist is required"),
  text: z.string().max(400, "Text must be less than 400 characters").optional(),
});

export const publisherOfTheWeekFormSchema = z.object({
  weekStart: z
    .string()
    .min(1, "Week is required")
    .transform(parseWeekString)
    .refine((d) => !Number.isNaN(d.getTime()), "Invalid week"),
  creatorId: z.string().min(1, "Publisher is required"),
  text: z.string().max(400, "Text must be less than 400 characters").optional(),
});

export const weekQuerySchema = z.object({ week: z.string() });
export const dateQuerySchema = z.object({ date: z.string() });
export const spotlightBlurbQuerySchema = z.object({
  week: z.string(),
  key: z.string(),
});
export const spotlightBlurbSaveSchema = z.object({
  blurb: z.string(),
});

export const updateCreatorEmailFormSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email"),
});
