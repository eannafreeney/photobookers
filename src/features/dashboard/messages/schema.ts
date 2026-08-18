import z from "zod";
import { POST_BODY_MAX_LENGTH } from "../../../domain/posts/utils";

export const createMessageFormSchema = z.object({
  body: z
    .string()
    .min(1, "Message is required")
    .max(POST_BODY_MAX_LENGTH),
  imageUrl: z.string().optional(), // URL, optional
});
