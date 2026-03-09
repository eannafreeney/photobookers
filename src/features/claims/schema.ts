import z from "zod";

// ============ CLAIM FORM SCHEMA ============
export const claimFormSchema = z.object({
  verificationUrl: z
    .url("Please enter a valid URL (e.g., https://example.com)")
    .optional()
    .or(z.literal("")),
});
