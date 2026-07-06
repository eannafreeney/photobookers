import z from "zod";
const createMessageFormSchema = z.object({
  body: z.string().min(1, "Message is required").max(5e3),
  imageUrl: z.string().optional()
  // URL, optional
});
export {
  createMessageFormSchema
};
