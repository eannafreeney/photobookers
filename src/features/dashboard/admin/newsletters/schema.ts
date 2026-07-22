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

export const newsletterMarkSentSchema = z.preprocess(
  (data) => {
    if (data instanceof FormData) {
      return { sent: data.getAll("sent").includes("true") };
    }
    return data;
  },
  z.object({ sent: z.boolean() }),
);
