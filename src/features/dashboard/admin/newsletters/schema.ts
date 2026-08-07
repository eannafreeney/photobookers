import { z } from "zod";

export const newsletterCampaignParamSchema = z.object({
  campaignId: z.string().uuid("Invalid campaign id"),
});

// Draft copy form: nothing is required — any field may be left blank. Used for
// both the client Alpine validation and the save route.
export const newsletterCampaignFormSchema = z.object({
  subject: z.string().max(180).optional(),
  introText: z.string().max(5000).optional(),
  outroText: z.string().max(5000).optional(),
  ctaText: z.string().max(120).optional(),
  ctaHref: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : val),
    z.url("CTA link must be a valid URL").max(500).optional(),
  ),
});

export type NewsletterCampaignFormSchema = z.infer<
  typeof newsletterCampaignFormSchema
>;

export const newsletterBrevoTestSchema = z.object({
  email: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : val),
    z.string().email("Enter a valid email address").optional(),
  ),
});

/** Checkbox + hidden "false" field → boolean. Hono form validator passes a plain object, not FormData. */
function coerceSentFlag(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (Array.isArray(value)) {
    return value.some((v) => v === true || v === "true");
  }
  return value === true || value === "true";
}

export const newsletterMarkSentSchema = z.preprocess((data) => {
  if (data instanceof FormData) {
    return { sent: data.getAll("sent").includes("true") };
  }
  if (data && typeof data === "object" && "sent" in data) {
    return { sent: coerceSentFlag((data as { sent: unknown }).sent) };
  }
  return { sent: false };
}, z.object({ sent: z.boolean() }));

