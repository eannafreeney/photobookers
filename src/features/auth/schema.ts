import z from "zod";
import { checkboxField } from "../../schemas";

// Helper: normalize URL for validation (accept www.example.com)
const urlWithOptionalProtocol = z
  .string()
  .transform((val) => {
    const trimmed = val.trim();
    if (trimmed && !/^https?:\/\//i.test(trimmed)) {
      return "https://" + trimmed;
    }
    return trimmed;
  })
  .pipe(z.string().url("Please enter a valid URL (e.g., https://example.com)"));

// ============ LOGIN FORM SCHEMA ============
export const loginFormSchema = z.object({
  email: z.email().min(1, "Email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// ============ REGISTER FAN FORM SCHEMA ============
export const registerFanFormSchema = z.object({
  firstName: z
    .string()
    .min(3, "First name must be at least 3 characters")
    .max(255, "First name must be less than 255 characters"),
  lastName: z
    .string()
    .min(3, "Last name must be at least 3 characters")
    .max(255, "Last name must be less than 255 characters"),
  type: z.literal("fan"),
  email: z.email().min(1, "Email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
  agreeToTerms: checkboxField,
  redirectUrl: z.string().optional(),
});

// ============ REGISTER CREATOR FORM SCHEMA ============
export const registerCreatorFormSchema = z.object({
  displayName: z.string().min(3, "Display Name must be at least 3 characters"),
  website: z.preprocess(
    (val) =>
      val === "" || (typeof val === "string" && val.trim() === "")
        ? undefined
        : val,
    urlWithOptionalProtocol.optional(),
  ),
  type: z.enum(["artist", "publisher"]),
  email: z.email().min(1, "Email is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(64, "Password must be less than 64 characters"),
  confirmPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(64, "Password must be less than 64 characters"),
  agreeToTerms: checkboxField,
});

// ============ RESET PASSWORD FORM SCHEMA ============
export const resetPasswordFormSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export const processRegisterQuerySchema = z.object({
  token_hash: z.string(),
  error: z.string().optional(),
  error_code: z.string().optional(),
  error_description: z.string().optional(),
});
