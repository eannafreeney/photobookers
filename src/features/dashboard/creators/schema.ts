import z from "zod";
import { methodField, optionalText } from "../../../schemas";

// ============ CREATOR FORM SCHEMA ============
export const creatorFormSchema = z.object({
  _method: methodField,
  displayName: z.string().min(3, "Display Name must be at least 3 characters"),
  tagline: z.string().max(150, "Tagline must be less than 150 characters"),
  bio: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional(),
  city: optionalText,
  country: optionalText,
  type: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.enum(["artist", "publisher"]),
  ),
  facebook: optionalText,
  twitter: optionalText,
  instagram: optionalText,
  website: optionalText,
});
