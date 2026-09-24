import { z } from "zod";

const asList = (value: unknown) => {
  if (value == null || value === "") return [];
  return Array.isArray(value) ? value : [value];
};

const optionalText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().max(2000).optional(),
);

export const quoteRequestSchema = z.object({
  printerIds: z.preprocess(
    asList,
    z.array(z.string().uuid()).min(1).max(3),
  ),
  copies: z.coerce.number().int().positive().max(100000),
  pageCount: z.coerce.number().int().positive().max(2000),
  trimSize: z.string().trim().min(1).max(80),
  binding: z.string().trim().min(1).max(120),
  deadline: z.string().trim().min(1).max(120),
  shipToCountry: z.string().trim().min(1).max(120),
  referenceBooks: optionalText,
  message: optionalText,
});

export const printerNoteSchema = z.object({
  replied: z.preprocess((value) => value === "on" || value === "true" || value === true, z.boolean()),
  printed: z.preprocess((value) => value === "on" || value === "true" || value === true, z.boolean()),
  body: z.string().trim().min(10, "Write a few sentences").max(2000),
});
