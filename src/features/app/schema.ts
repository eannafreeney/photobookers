import { z } from "zod";

// ============ VALIDATE PASSWORD SCHEMA ============
export const contactFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().min(1, "Email is required"),
  message: z.string().min(1, "Message is required"),
  website: z.string().optional(),
  ts: z.number().optional(),
});



export const slugSchema = z.object({
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain only lowercase letters, numbers, and hyphens",
    ),
});

export const tagSchema = z.object({
  tag: z
    .string()
    .min(1, "Tag is required")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Tag must contain only lowercase letters, numbers, and hyphens",
    ),
});
