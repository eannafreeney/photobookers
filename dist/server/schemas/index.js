import { z } from "zod";
const optionalText = z.preprocess(
  (v) => typeof v === "string" && v.trim() === "" ? void 0 : v,
  z.string().optional()
);
const requiredText = z.preprocess(
  (v) => typeof v === "string" ? v.trim() : v,
  z.string().min(2, "Required")
);
const numberField = z.preprocess(
  (v) => v === "" ? void 0 : Number(v),
  z.number().optional()
);
const checkboxField = z.preprocess(
  (v) => v === true || v === "on" || v === "true" || v === "1",
  z.boolean()
);
const uuidField = z.string().uuid("Invalid UUID format").transform((val) => val.toLowerCase());
const methodField = z.preprocess(
  (v) => v === "" ? void 0 : v,
  z.enum(["PATCH", "POST", "DELETE"]).optional()
);
const magicLinkFormSchema = z.object({
  actionLink: z.string().min(1, "Action link is required")
});
const bookIdSchema = z.object({
  bookId: uuidField
});
const bookArtistIdSchema = bookIdSchema.extend({
  artistId: uuidField
});
const bookPublisherIdSchema = bookIdSchema.extend({
  publisherId: uuidField
});
const userIdSchema = z.object({
  userId: uuidField
});
const creatorIdSchema = z.object({
  creatorId: uuidField
});
const claimIdSchema = z.object({
  claimId: uuidField
});
const redirectUrlSchema = z.object({
  redirectUrl: z.string().optional()
});
const currentPathSchema = z.object({
  currentPath: z.string().optional()
});
export {
  bookArtistIdSchema,
  bookIdSchema,
  bookPublisherIdSchema,
  checkboxField,
  claimIdSchema,
  creatorIdSchema,
  currentPathSchema,
  magicLinkFormSchema,
  methodField,
  numberField,
  optionalText,
  redirectUrlSchema,
  requiredText,
  userIdSchema,
  uuidField
};
