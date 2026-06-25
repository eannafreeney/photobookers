import { z } from "zod";

const optionalCoordinate = (min: number, max: number) =>
  z.preprocess(
    (value) => (value === "" || value == null ? undefined : value),
    z.coerce.number().min(min).max(max).optional(),
  );

export const storeFormAdminSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  latitude: optionalCoordinate(-90, 90),
  longitude: optionalCoordinate(-180, 180),
  status: z.enum(["draft", "published"]),
  sort_order: z.coerce.number().optional(),
});

export const storeIdSchema = z.object({
  storeId: z.string().uuid(),
});
