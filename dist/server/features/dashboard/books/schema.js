import { z } from "zod";
import { checkboxField, optionalText } from "../../../schemas/index.js";
const bookFormSchema = z.object({
  title: z.string().min(3, "Title is required"),
  intent: z.enum(["publisher", "artist"]),
  artist_id: optionalText,
  new_artist_name: optionalText,
  publisher_id: optionalText,
  new_publisher_name: optionalText,
  description: z.string().max(5e3, "Description must be less than 5000 characters").optional(),
  release_date: optionalText,
  send_email_to_followers_on_release: checkboxField.optional().default(false),
  tags: optionalText,
  purchase_link: optionalText,
  availability_status: z.preprocess(
    (val) => val === "" ? void 0 : val,
    z.enum(["available", "sold_out", "unavailable"])
  ).default("available")
});
export {
  bookFormSchema
};
