import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { formValidator, paramValidator } from "../../../../../lib/validator.js";
import {
  newsletterCampaignFormSchema,
  newsletterCampaignParamSchema
} from "../../../../../features/dashboard/admin/newsletters/schema.js";
import {
  buildCampaignPreviewHtml,
  getNewsletterCampaignById,
  updateNewsletterCampaignDraft
} from "../../../../../features/dashboard/admin/newsletters/services.js";
import Alert from "../../../../../components/app/Alert.js";
import CampaignPreview from "../../../../../features/dashboard/admin/newsletters/components/CampaignPreview.js";
const POST = createRoute(
  paramValidator(newsletterCampaignParamSchema),
  formValidator(newsletterCampaignFormSchema),
  async (c) => {
    const { campaignId } = c.req.valid("param");
    const form = c.req.valid("form");
    const campaign = await getNewsletterCampaignById(campaignId);
    if (!campaign) return c.html(/* @__PURE__ */ jsx(Fragment, {}));
    const isSent = campaign.status === "sent";
    const [error] = await updateNewsletterCampaignDraft(campaignId, {
      subject: form.subject ?? "",
      introText: form.introText ?? "",
      outroText: form.outroText ?? "",
      ctaText: form.ctaText ?? "",
      ctaHref: form.ctaHref ?? null,
      status: isSent ? "sent" : "draft",
      sentAt: isSent ? campaign.sentAt : null
    });
    if (error) return c.html(/* @__PURE__ */ jsx(Alert, { type: "danger", message: error.reason }));
    const previewHtml = await buildCampaignPreviewHtml(campaign);
    return c.html(
      /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Alert, { type: "success", message: "Draft saved." }),
        /* @__PURE__ */ jsx(CampaignPreview, { previewHtml })
      ] })
    );
  }
);
export {
  POST
};
