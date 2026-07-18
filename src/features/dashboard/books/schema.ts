import { z } from "zod";
import { checkboxField, optionalText } from "../../../schemas";
import { pressLinksFormField } from "./pressLinks";

// ============ BOOK FORM SCHEMA ============
export const bookFormSchema = z.object({
  title: z.string().min(3, "Title is required"),
  intent: z.enum(["publisher", "artist"]),
  artist_id: optionalText,
  new_artist_name: optionalText,
  publisher_id: optionalText,
  new_publisher_name: optionalText,
  description: z
    .string()
    .max(5000, "Description must be less than 5000 characters")
    .optional(),
  release_date: optionalText,
  send_email_to_followers_on_release: checkboxField.optional().default(false),
  tags: z.preprocess(
    (v) => (typeof v === "string" ? v.trim() : v),
    z.string().min(1, "At least one tag is required"),
  ),
  purchase_link: optionalText,
  press_links: pressLinksFormField,
  availability_status: z
    .preprocess(
      (val) => (val === "" ? undefined : val),
      z.enum(["available", "sold_out", "unavailable"]),
    )
    .default("available"),
});
