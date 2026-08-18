import { z } from "zod";
const newsletterCampaignParamSchema = z.object({
  campaignId: z.string().uuid("Invalid campaign id")
});
const newsletterCampaignFormSchema = z.object({
  subject: z.string().max(180).optional(),
  introText: z.string().max(5e3).optional(),
  outroText: z.string().max(5e3).optional(),
  ctaText: z.string().max(120).optional(),
  ctaHref: z.preprocess(
    (val) => val === "" || val === void 0 ? void 0 : val,
    z.url("CTA link must be a valid URL").max(500).optional()
  )
});
const newsletterBrevoTestSchema = z.object({
  email: z.preprocess(
    (val) => val === "" || val === void 0 ? void 0 : val,
    z.string().email("Enter a valid email address").optional()
  )
});
function coerceSentFlag(value) {
  if (typeof value === "boolean") return value;
  if (Array.isArray(value)) {
    return value.some((v) => v === true || v === "true");
  }
  return value === true || value === "true";
}
const newsletterMarkSentSchema = z.preprocess((data) => {
  if (data instanceof FormData) {
    return { sent: data.getAll("sent").includes("true") };
  }
  if (data && typeof data === "object" && "sent" in data) {
    return { sent: coerceSentFlag(data.sent) };
  }
  return { sent: false };
}, z.object({ sent: z.boolean() }));
export {
  newsletterBrevoTestSchema,
  newsletterCampaignFormSchema,
  newsletterCampaignParamSchema,
  newsletterMarkSentSchema
};
