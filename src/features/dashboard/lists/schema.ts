import z from "zod";
import { checkboxField } from "../../../schemas";
import {
  LIST_ITEM_NOTE_MAX_LENGTH,
  listSlugSchema,
  listTitleSchema,
} from "../../../domain/lists/utils";

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

export const listBookNoteFormSchema = z.object({
  note: z
    .string()
    .trim()
    .max(LIST_ITEM_NOTE_MAX_LENGTH, "Note is too long")
    .optional()
    .default(""),
});
