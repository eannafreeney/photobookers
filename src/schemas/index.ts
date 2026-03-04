import { z } from "zod";

export const optionalText = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
  z.string().optional(),
);

export const requiredText = z.preprocess(
  (v) => (typeof v === "string" ? v.trim() : v),
  z.string().min(2, "Required"),
);

export const numberField = z.preprocess(
  (v) => (v === "" ? undefined : Number(v)),
  z.number().optional(),
);

export const uuidField = z
  .string()
  .uuid("Invalid UUID format")
  .transform((val) => val.toLowerCase());

export const methodField = z.preprocess(
  (v) => (v === "" ? undefined : v),
  z.enum(["PATCH", "POST", "DELETE"]).optional(),
);

export const agreeToTerms = z.preprocess(
  (v) => v === true || v === "on" || v === "true" || v === "1",
  z
    .boolean()
    .refine(
      (val) => val,
      "Please agree to the terms and conditions to continue",
    ),
);

// ============ MAGIC LINK FORM SCHEMA ============
export const magicLinkFormSchema = z.object({
  actionLink: z.string().min(1, "Action link is required"),
});

// ============ UUID SCHEMA ============

// Use for specific params
export const bookIdSchema = z.object({
  bookId: uuidField,
});

export const userIdSchema = z.object({
  userId: uuidField,
});

export const creatorIdSchema = z.object({
  creatorId: uuidField,
});

export const claimIdSchema = z.object({
  claimId: uuidField,
});

export const redirectUrlSchema = z.object({
  redirectUrl: z.string().optional(),
});

export const currentPathSchema = z.object({
  currentPath: z.string().optional(),
});
