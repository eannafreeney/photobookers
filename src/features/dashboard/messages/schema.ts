import z from "zod";

export const createMessageFormSchema = z.object({
  body: z.string().min(1, "Message is required").max(5000),
  imageUrl: z.string().optional(), // URL, optional
});
