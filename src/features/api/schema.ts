import { z } from "zod";
import { uuidField } from "../../schemas";

export const addCommentFormSchema = z.object({
  body: z
    .string()
    .transform((value) => value.trim())
    .refine((value) => value.length >= 1, {
      message: "Comment is required",
    })
    .refine((value) => value.length <= 1000, {
      message: "Comment must be 1000 characters or less",
    }),
});

export const newsletterFormSchema = z.object({
  email: z.string().email().min(1, "Email is required"),
});

export const commentIdSchema = z.object({
  commentId: uuidField,
});

export const editCommentParamSchema = z.object({
  bookId: uuidField,
  commentId: uuidField,
});
