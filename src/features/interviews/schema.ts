import z from "zod";

export const interviewFormSchema = z.object({
  q1: z.string().min(1).max(3000),
  q2: z.string().min(1).max(3000),
  q3: z.string().min(1).max(3000),
  q4: z.string().min(1).max(3000),
  q5: z.string().min(1).max(3000),
});
