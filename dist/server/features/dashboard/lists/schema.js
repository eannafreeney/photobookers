import z from "zod";
import { checkboxField } from "../../../schemas/index.js";
import {
  LIST_ITEM_NOTE_MAX_LENGTH,
  listSlugSchema,
  listTitleSchema
} from "../../../domain/lists/utils.js";
const listFormSchema = z.object({
  title: listTitleSchema,
  description: z.string().trim().max(2e3, "Description is too long").optional().default(""),
  slug: z.string().optional().default(""),
  isPublic: checkboxField.optional().default(false)
});
const listFormEditSchema = listFormSchema.extend({
  slug: listSlugSchema
});
const listBookNoteFormSchema = z.object({
  note: z.string().trim().max(LIST_ITEM_NOTE_MAX_LENGTH, "Note is too long").optional().default("")
});
export {
  listBookNoteFormSchema,
  listFormEditSchema,
  listFormSchema
};
