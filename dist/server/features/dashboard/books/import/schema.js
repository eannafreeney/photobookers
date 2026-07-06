import { z } from "zod";
const availabilityStatusSchema = z.enum([
  "available",
  "sold_out",
  "unavailable"
]);
const csvBookRowSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters"),
  description: z.string().trim().max(5e3, "Description must be less than 5000 characters").optional(),
  release_date: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Release date must be YYYY-MM-DD").optional().or(z.literal("")),
  tags: z.string().trim().optional(),
  purchase_link: z.string().trim().optional(),
  availability_status: availabilityStatusSchema.default("available"),
  artist: z.string().trim().optional(),
  publisher: z.string().trim().optional()
});
const validatedCsvBookRowSchema = csvBookRowSchema.extend({
  rowNumber: z.number().int().positive()
});
const importConfirmRowsSchema = z.array(validatedCsvBookRowSchema).min(1);
export {
  csvBookRowSchema,
  importConfirmRowsSchema,
  validatedCsvBookRowSchema
};
