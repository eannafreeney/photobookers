import z from "zod";
const interviewFormSchema = z.object({
  q1: z.string().min(1).max(3e3),
  q2: z.string().min(1).max(3e3),
  q3: z.string().min(1).max(3e3),
  q4: z.string().min(1).max(3e3),
  q5: z.string().min(1).max(3e3),
  promoImage: z.instanceof(File).optional()
});
const interviewIdSchema = z.object({
  interviewId: z.string().uuid()
});
export {
  interviewFormSchema,
  interviewIdSchema
};
