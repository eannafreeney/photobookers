import { z } from "zod";
const MAX_BOOK_PRESS_LINKS = 5;
const bookPressLinkSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120, "Title must be 120 characters or less"),
  url: z.string().trim().url("Enter a valid URL"),
  quote: z.string().trim().max(500, "Quote must be 500 characters or less").optional().nullable().transform((v) => v ? v : null)
});
const pressLinksFormField = z.preprocess((value) => {
  if (value === void 0 || value === null || value === "") return void 0;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
}, z.array(bookPressLinkSchema).max(MAX_BOOK_PRESS_LINKS).optional());
function serializePressLinks(links) {
  return JSON.stringify(links ?? []);
}
export {
  MAX_BOOK_PRESS_LINKS,
  bookPressLinkSchema,
  pressLinksFormField,
  serializePressLinks
};
