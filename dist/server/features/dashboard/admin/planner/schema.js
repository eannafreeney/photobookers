import { z } from "zod";
import { parseDateString, parseWeekString } from "../../../../lib/utils.js";
const bookOfTheDayFormSchema = z.object({
  date: z.string().min(1, "Date is required").transform(parseDateString).refine((d) => !Number.isNaN(d.getTime()), "Invalid date"),
  bookId: z.string().min(1, "Book is required")
});
const sendBOTDCreatorEmailFormSchema = z.object({
  recipientType: z.enum(["artist", "publisher"]),
  creatorId: z.string().min(1, "Creator is required"),
  bookId: z.string().min(1, "Book is required"),
  date: z.string().min(1, "Date is required").transform(parseDateString).refine((d) => !Number.isNaN(d.getTime()), "Invalid date"),
  emailKind: z.enum(["advance", "feature_day"]).default("advance")
});
const sendAOTWCreatorEmailFormSchema = z.object({
  creatorId: z.string().min(1, "Creator is required"),
  weekStart: z.string().min(1, "Week is required").transform(parseWeekString).refine((d) => !Number.isNaN(d.getTime()), "Invalid week"),
  emailKind: z.enum(["advance", "interview_reminder", "feature_day"]).default("advance")
});
const sendPOTWCreatorEmailFormSchema = z.object({
  creatorId: z.string().min(1, "Creator is required"),
  weekStart: z.string().min(1, "Week is required").transform(parseWeekString).refine((d) => !Number.isNaN(d.getTime()), "Invalid week"),
  emailKind: z.enum(["advance", "interview_reminder", "feature_day"]).default("advance")
});
const setEmailFormSchema = z.object({
  recipientType: z.preprocess(
    (val) => val === "" || val === void 0 ? null : val,
    z.enum(["artist", "publisher"]).nullable()
  ),
  creatorId: z.string().min(1, "Creator is required"),
  email: z.string().min(1, "Email is required"),
  bookId: z.preprocess(
    (val) => val === "" || val === void 0 ? null : val,
    z.string().nullable()
  ),
  /** Present when scheduling a BOTD email flow. */
  date: z.string().optional().transform((val) => val ? parseDateString(val) : null).refine(
    (d) => d === null || !Number.isNaN(d.getTime()),
    "Invalid date"
  ),
  /** Present when scheduling an AOTW/POTW email flow. */
  weekStart: z.string().optional().transform((val) => val ? parseWeekString(val) : null).refine(
    (d) => d === null || !Number.isNaN(d.getTime()),
    "Invalid week"
  )
});
const artistOfTheWeekFormSchema = z.object({
  weekStart: z.string().min(1, "Week is required").transform(parseWeekString).refine((d) => !Number.isNaN(d.getTime()), "Invalid week"),
  creatorId: z.string().min(1, "Artist is required"),
  text: z.string().max(400, "Text must be less than 400 characters").optional()
});
const publisherOfTheWeekFormSchema = z.object({
  weekStart: z.string().min(1, "Week is required").transform(parseWeekString).refine((d) => !Number.isNaN(d.getTime()), "Invalid week"),
  creatorId: z.string().min(1, "Publisher is required"),
  text: z.string().max(400, "Text must be less than 400 characters").optional()
});
const weekQuerySchema = z.object({ week: z.string() });
const dateQuerySchema = z.object({ date: z.string() });
const spotlightBlurbQuerySchema = z.object({
  week: z.string(),
  key: z.string()
});
const spotlightBlurbSaveSchema = z.object({
  blurb: z.string()
});
const updateCreatorEmailFormSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email")
});
export {
  artistOfTheWeekFormSchema,
  bookOfTheDayFormSchema,
  dateQuerySchema,
  publisherOfTheWeekFormSchema,
  sendAOTWCreatorEmailFormSchema,
  sendBOTDCreatorEmailFormSchema,
  sendPOTWCreatorEmailFormSchema,
  setEmailFormSchema,
  spotlightBlurbQuerySchema,
  spotlightBlurbSaveSchema,
  updateCreatorEmailFormSchema,
  weekQuerySchema
};
