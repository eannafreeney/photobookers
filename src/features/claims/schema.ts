import z from "zod";

// ============ CLAIM FORM SCHEMA ============
export const claimFormSchema = z.object({
  verificationMethod: z.enum(["website", "instagram"]).default("website"),
  verificationUrl: z
    .url("Please enter a valid URL (e.g., https://example.com)")
    .min(1, "Website URL is required"),
  email: z.email(),
});

export const tokenSchema = z.object({
  token: z.string().min(1, "Token is required"),
});
