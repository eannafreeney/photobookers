import z from "zod";
import { checkboxField } from "../../../schemas";
import { listSlugSchema, listTitleSchema } from "../../../domain/lists/utils";

export const listFormSchema = z.object({
  title: listTitleSchema,
  description: z
    .string()
    .trim()
    .max(2000, "Description is too long")
    .optional()
    .default(""),
  slug: z.string().optional().default(""),
  isPublic: checkboxField.optional().default(false),
});

export const listFormEditSchema = listFormSchema.extend({
  slug: listSlugSchema,
});
