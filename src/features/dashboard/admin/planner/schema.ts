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
