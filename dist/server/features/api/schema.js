import { z } from "zod";
import { uuidField } from "../../schemas/index.js";
const addCommentFormSchema = z.object({
  body: z.string().transform((value) => value.trim()).refine((value) => value.length >= 1, {
    message: "Comment is required"
  }).refine((value) => value.length <= 1e3, {
    message: "Comment must be 1000 characters or less"
  })
});
const newsletterFormSchema = z.object({
  email: z.string().email().min(1, "Email is required")
});
const commentIdSchema = z.object({
  commentId: uuidField
});
const editCommentParamSchema = z.object({
  bookId: uuidField,
  commentId: uuidField
});
export {
  addCommentFormSchema,
  commentIdSchema,
  editCommentParamSchema,
  newsletterFormSchema
};
