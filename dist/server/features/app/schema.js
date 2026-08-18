import { z } from "zod";
import { normalizeTagSlug } from "../../lib/tags.js";
import { parseDateString, parseWeekString } from "../../lib/utils.js";
import { optionalText } from "../../schemas/index.js";
const contactFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().min(1, "Email is required"),
  message: z.string().min(1, "Message is required"),
  website: z.string().optional(),
  ts: z.coerce.number().optional()
});
const userUpdateFormSchema = z.object({
  msg: z.string().optional()
});
const userProfileFormSchema = z.object({
  firstName: optionalText,
  lastName: optionalText
});
const dateParamSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).transform(parseDateString).refine((d) => !Number.isNaN(d.getTime()), "Invalid date")
});
const weekParamSchema = z.object({
  week: z.string().regex(/^\d{4}-W(0[1-9]|[1-4][0-9]|5[0-3])$/).transform(parseWeekString).refine((d) => !Number.isNaN(d.getTime()), "Invalid week")
});
const normalizeSlug = (value) => value.toLowerCase().trim().replace(/-+/g, "-").replace(/_+/g, "_").replace(/^[-_]|[-_]$/g, "");
const slugSchema = z.object({
  slug: z.string().transform(normalizeSlug).pipe(
    z.string().min(1, "Slug is required").regex(
      /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/,
      "Slug must contain only lowercase letters, numbers, hyphens, and underscores"
    )
  )
});
const idSchema = z.object({
  id: z.string().uuid("Invalid id")
});
const tagSchema = z.object({
  tag: z.string().transform(normalizeTagSlug).pipe(
    z.string().min(1, "Tag is required").regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Tag must contain only lowercase letters, numbers, and hyphens"
    )
  )
});
export {
  contactFormSchema,
  dateParamSchema,
  idSchema,
  slugSchema,
  tagSchema,
  userProfileFormSchema,
  userUpdateFormSchema,
  weekParamSchema
};
