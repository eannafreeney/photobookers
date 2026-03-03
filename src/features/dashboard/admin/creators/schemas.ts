import { z } from "zod";
import { optionalText, requiredText } from "../../../../schemas";

// ============ MANUAL ASSIGN CREATOR SCHEMA ============
export const manualAssignCreatorSchema = z.object({
  userId: requiredText,
});

// ============ CREATOR FORM ADMIN SCHEMA ============
export const creatorFormAdminSchema = z.object({
  displayName: requiredText,
  website: z.url("Please enter a valid URL (e.g., https://example.com)"),
  type: z.enum(["artist", "publisher"]).default("artist"),
  tagline: optionalText,
  bio: optionalText,
  city: optionalText,
  country: optionalText,
  facebook: optionalText,
  twitter: optionalText,
  instagram: optionalText,
});
