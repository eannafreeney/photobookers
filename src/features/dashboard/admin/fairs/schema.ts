import { z } from "zod";

export const fairFormAdminSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  venue: z.string().optional(),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  status: z.enum(["draft", "published", "cancelled"]),
  listing_tier: z.enum(["free", "promoted"]).optional(),
  sort_order: z.coerce.number().optional(),
});

export const fairIdSchema = z.object({
  fairId: z.string().uuid(),
});

export const attendeeSchema = z.object({
  creatorId: z.string().uuid(),
});
