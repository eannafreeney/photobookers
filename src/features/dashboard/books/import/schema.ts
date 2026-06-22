import { z } from "zod";

const availabilityStatusSchema = z.enum([
  "available",
  "sold_out",
  "unavailable",
]);

export const csvBookRowSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters"),
  description: z
    .string()
    .trim()
    .max(5000, "Description must be less than 5000 characters")
    .optional(),
  release_date: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Release date must be YYYY-MM-DD")
    .optional()
    .or(z.literal("")),
  tags: z.string().trim().optional(),
  purchase_link: z.string().trim().optional(),
  availability_status: availabilityStatusSchema.default("available"),
  artist: z.string().trim().optional(),
  publisher: z.string().trim().optional(),
});

export type CsvBookRow = z.infer<typeof csvBookRowSchema>;

export const validatedCsvBookRowSchema = csvBookRowSchema.extend({
  rowNumber: z.number().int().positive(),
});

export type ValidatedCsvBookRow = z.infer<typeof validatedCsvBookRowSchema>;

export const importConfirmRowsSchema = z
  .array(validatedCsvBookRowSchema)
  .min(1);
