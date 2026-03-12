import z from "zod";

export const createMessageFormSchema = z.object({
  body: z.string().min(1, "Message is required").max(5000),
  imageUrls: z.string().optional(), // comma-separated URLs, optional
});
