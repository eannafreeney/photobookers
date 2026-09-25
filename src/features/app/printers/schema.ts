import { z } from "zod";

const asList = (value: unknown) => {
  if (value == null || value === "") return [];
  return Array.isArray(value) ? value : [value];
};

const optionalText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().max(2000).optional(),
);

export const printerRecommendationSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  city: z.string().trim().min(1, "City is required").max(120),
  country: z.string().trim().min(1, "Country is required").max(120),
  link: z
    .string()
    .trim()
    .url("Link must be a valid URL")
    .max(500),
});

export const quoteRequestSchema = z.object({
  printerIds: z.preprocess(
    asList,
    z.array(z.string().uuid()).min(1).max(3),
  ),
  projectName: z.string().trim().min(1).max(200),
  details: z.string().trim().min(1).max(4000),
  shipToCountry: z.string().trim().min(1).max(120),
  note: optionalText,
});
