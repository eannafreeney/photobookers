import { z } from "zod";
import { optionalText } from "../../schemas";
import { shelfSlugSchema } from "../shelf/utils";

const httpUrl = z
  .string()
  .trim()
  .url("Enter a full URL starting with https://")
  .refine((value) => /^https?:\/\//i.test(value), "Enter an http or https URL");

export const optionalUrl = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  httpUrl.optional(),
);

export const reviewerProfileSchema = z.object({
  slug: z.string().pipe(shelfSlugSchema),
  display_name: z.string().trim().min(2, "Name is required").max(80),
  bio: z.string().trim().max(2000).optional().or(z.literal("")),
  website: optionalUrl,
});

export const reviewFormSchema = z.object({
  title: z.string().trim().min(2, "Title is required").max(200),
  body: z.string().trim().min(2, "Write a few words").max(20000),
  external_url: optionalUrl,
});

export const reviewRequestSchema = z.object({
  note: optionalText,
});

export const reviewRequestStatusSchema = z.object({
  status: z.enum(["approved", "declined", "sent"]),
});
