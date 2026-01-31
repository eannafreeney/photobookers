import { z } from "zod";

const optionalText = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
  z.string().optional()
);

const requiredText = z.preprocess(
  (v) => (typeof v === "string" ? v.trim() : v),
  z.string().min(1, "Required")
);

const numberField = z.preprocess(
  (v) => (v === "" ? undefined : Number(v)),
  z.number().optional()
);

// ============ REGISTER FORM SCHEMA ============
export const registerFormSchema = z.object({
  firstName: z
    .string()
    .min(3, "First name must be at least 3 characters")
    .max(255, "First name must be less than 255 characters"),
  lastName: z
    .string()
    .min(3, "Last name must be at least 3 characters")
    .max(255, "Last name must be less than 255 characters"),
  type: z.enum(["fan", "artist", "publisher"]),
  email: z.email().min(1, "Email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
  agreeToTerms: z
    .boolean()
    .refine(
      (val) => val,
      "Please agree to the terms and conditions to continue"
    ),
});

// ============ LOGIN FORM SCHEMA ============
export const loginFormSchema = z.object({
  email: z.email().min(1, "Email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// ============ CREATOR FORM SCHEMA ============
export const creatorFormSchema = z.object({
  displayName: z.string().min(3, "Display Name must be at least 3 characters"),
  tagline: z.string().max(200, "Tagline must be less than 200 characters"),
  bio: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must be less than 1000 characters"),
  city: z.string().min(3, "City must be at least 3 characters"),
  country: z.string().min(2, "Country must be at least 2 characters"),
  type: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.enum(["artist", "publisher"])
  ),
  facebook: optionalText,
  twitter: optionalText,
  instagram: optionalText,
  website: optionalText,
});

// ============ Image FORM SCHEMA ============
export const coverImageFormSchema = z.object({
  cover: z.object({
    size: z.number().max(5 * 1024 * 1024),
    type: z.string(),
    name: z.string(),
  }),
});

// ============ UUID SCHEMA ============
const uuidField = z
  .string()
  .uuid("Invalid UUID format")
  .transform((val) => val.toLowerCase());

// Use for specific params
export const bookIdSchema = z.object({
  bookId: uuidField,
});

export const creatorIdSchema = z.object({
  creatorId: uuidField,
});

// ============ CLAIM FORM SCHEMA ============
export const claimFormSchema = z.object({
  verificationMethod: z.enum(["website", "instagram"]).default("website"),
  verificationUrl: z
    .url("Please enter a valid URL (e.g., https://example.com)")
    .min(1, "Website URL is required"),
  name: z.string(),
  email: z.email(),
});

// ============ BOOK FORM SCHEMA ============
// This validates form input, NOT database values
export const bookFormSchema = z.object({
  title: z.string().min(3, "Title is required"),
  tagline: z.string().max(200, "Tagline must be less than 200 characters"),
  artist_id: optionalText,
  new_artist_name: optionalText,
  publisher_id: optionalText,
  new_publisher_name: optionalText,
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description must be less than 5000 characters"),
  specs: z
    .string()
    .min(10, "Specs must be at least 10 characters")
    .max(1000, "Specs must be less than 1000 characters"),
  release_date: optionalText,
  tags: optionalText,
  availability_status: z
    .preprocess(
      (val) => (val === "" ? undefined : val),
      z.enum(["available", "sold_out", "unavailable"])
    )
    .default("available"),
});
