import { z } from "zod";

// ============ VALIDATE PASSWORD SCHEMA ============
export const contactFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().min(1, "Email is required"),
  message: z.string().min(1, "Message is required"),
});

export const newsletterFormSchema = z.object({
  email: z.string().email().min(1, "Email is required"),
});
