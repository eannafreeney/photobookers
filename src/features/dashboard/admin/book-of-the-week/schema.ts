import { z } from "zod";
import { parseWeekString } from "../../../../lib/utils";

// ============ BOOK OF THE WEEK FORM SCHEMA ============
export const bookOfTheWeekFormSchema = z.object({
  weekStart: z
    .string()
    .min(1, "Week is required")
    .transform(parseWeekString)
    .refine((d) => !Number.isNaN(d.getTime()), "Invalid week"),
  text: z
    .string()
    .min(1, "Text is required")
    .max(250, "Text must be less than 250 characters"),
});
