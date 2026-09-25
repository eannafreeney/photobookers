import { z } from "zod";

const optionalCoordinate = (min: number, max: number) =>
  z.preprocess(
    (value) => (value === "" || value == null ? undefined : value),
    z.coerce.number().min(min).max(max).optional(),
  );

const optionalText = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""));

export const printerFormAdminSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("A valid email is required"),
  description: optionalText,
  city: z.string().trim().min(1, "City is required"),
  country: z.string().trim().min(1, "Country is required"),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  latitude: optionalCoordinate(-90, 90),
  longitude: optionalCoordinate(-180, 180),
});

export const printerIdSchema = z.object({
  printerId: z.string().uuid(),
});
