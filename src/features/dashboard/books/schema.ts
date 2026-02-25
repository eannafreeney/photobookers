import { z } from "zod";
import { optionalText } from "../../../schemas";

// ============ BOOK FORM SCHEMA ============
export const bookFormSchema = z.object({
  title: z.string().min(3, "Title is required"),
  artist_id: optionalText,
  new_artist_name: optionalText,
  publisher_id: optionalText,
  new_publisher_name: optionalText,
  description: z
    .string()
    .max(5000, "Description must be less than 5000 characters")
    .optional(),
  release_date: optionalText,
  tags: optionalText,
  purchase_link: optionalText,
  availability_status: z
    .preprocess(
      (val) => (val === "" ? undefined : val),
      z.enum(["available", "sold_out", "unavailable"]),
    )
    .default("available"),
});
