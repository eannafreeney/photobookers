import z from "zod";
import { checkboxField } from "../../schemas";

// ============ CLAIM FORM SCHEMA ============
export const claimFormSchema = z.object({
  verificationUrl: z
    .url("Please enter a valid URL (e.g., https://example.com)")
    .optional()
    .or(z.literal("")),
});

// ============ REGISTER + CLAIM (FAN FIELDS + VERIFICATION URL) ============
export const registerAndClaimFormSchema = z.object({
  firstName: z
    .string()
    .min(3, "First name must be at least 3 characters")
    .max(255, "First name must be less than 255 characters"),
  lastName: z
    .string()
    .min(3, "Last name must be at least 3 characters")
    .max(255, "Last name must be less than 255 characters"),
  type: z.literal("fan"),
  email: z.string().email("Email is required"),
  agreeToTerms: checkboxField,
  verificationUrl: z
    .string()
    .url("Please enter a valid URL (e.g., https://example.com)")
    .optional()
    .or(z.literal("")),
  captchaToken: z.string().min(1, "Please complete the CAPTCHA"),
});

export const claimCompleteQuerySchema = z.object({
  creatorId: z.string().uuid(),
  verificationUrl: z
    .string()
    .url("Please enter a valid URL (e.g., https://example.com)"),
});
