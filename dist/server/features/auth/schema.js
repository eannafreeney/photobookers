import z from "zod";
import { checkboxField } from "../../schemas/index.js";
function parseRegisterType(raw) {
  if (raw === "fan" || raw === "artist" || raw === "publisher") return raw;
  return "fan";
}
const urlWithOptionalProtocol = z.string().transform((val) => {
  const trimmed = val.trim();
  if (trimmed && !/^https?:\/\//i.test(trimmed)) {
    return "https://" + trimmed;
  }
  return trimmed;
}).pipe(z.string().url("Please enter a valid URL (e.g., https://example.com)"));
const loginFormSchema = z.object({
  email: z.email().min(1, "Email is required"),
  password: z.string().min(8, "Password must be at least 8 characters")
});
const forgotPasswordFormSchema = z.object({
  email: z.email().min(1, "Email is required")
});
const registerFanFormSchema = z.object({
  firstName: z.string().min(3, "First name must be at least 3 characters").max(255, "First name must be less than 255 characters"),
  lastName: z.string().min(3, "Last name must be at least 3 characters").max(255, "Last name must be less than 255 characters"),
  type: z.literal("fan"),
  email: z.email().min(1, "Email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
  agreeToTerms: checkboxField,
  redirectUrl: z.string().optional(),
  captchaToken: z.string().min(1, "Please complete the CAPTCHA")
});
const registerCreatorFormSchema = z.object({
  displayName: z.string().min(3, "Display Name must be at least 3 characters"),
  website: z.preprocess(
    (val) => val === "" || typeof val === "string" && val.trim() === "" ? void 0 : val,
    urlWithOptionalProtocol.optional()
  ),
  type: z.enum(["artist", "publisher"]),
  email: z.email().min(1, "Email is required"),
  password: z.string().min(8, "Password must be at least 8 characters").max(64, "Password must be less than 64 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters").max(64, "Password must be less than 64 characters"),
  agreeToTerms: checkboxField,
  captchaToken: z.string().min(1, "Please complete the CAPTCHA")
});
const resetPasswordFormSchema = z.object({
  isModal: z.union([z.boolean(), z.literal("true"), z.literal("false")]).optional().transform((v) => v === true || v === "true"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
  redirectUrl: z.string().optional()
});
const processRegisterQuerySchema = z.object({
  token_hash: z.string(),
  error: z.string().optional(),
  error_code: z.string().optional(),
  error_description: z.string().optional()
});
const recoveryQuerySchema = z.object({
  token_hash: z.string().optional(),
  error: z.string().optional(),
  error_code: z.string().optional(),
  error_description: z.string().optional(),
  redirectUrl: z.string().optional()
});
export {
  forgotPasswordFormSchema,
  loginFormSchema,
  parseRegisterType,
  processRegisterQuerySchema,
  recoveryQuerySchema,
  registerCreatorFormSchema,
  registerFanFormSchema,
  resetPasswordFormSchema
};
