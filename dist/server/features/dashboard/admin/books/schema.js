import z from "zod";
import { optionalDateString, optionalText } from "../../../../schemas/index.js";
import { pressLinksFormField } from "../../books/pressLinks.js";
const bookFormAdminSchema = z.object({
  title: z.string().min(1, "Title is required"),
  artist_id: optionalText,
  new_artist_name: optionalText,
  publisher_id: optionalText,
  new_publisher_name: optionalText,
  description: z.string().max(5e3, "Description must be less than 5000 characters").optional(),
  release_date: optionalDateString,
  send_email_to_followers_on_release: z.preprocess((val) => val !== void 0 && val !== null, z.boolean()).optional().default(false),
  tags: optionalText,
  purchase_link: optionalText,
  press_links: pressLinksFormField,
  availability_status: z.preprocess(
    (val) => val === "" ? void 0 : val,
    z.enum(["available", "sold_out", "unavailable"])
  ).default("available")
});
export {
  bookFormAdminSchema
};
