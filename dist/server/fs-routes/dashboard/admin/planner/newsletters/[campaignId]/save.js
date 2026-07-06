import { Fragment, jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { formValidator, paramValidator } from "../../../../../../lib/validator.js";
import {
  newsletterCampaignEditSchema,
  newsletterCampaignParamSchema
} from "../../../../../../features/dashboard/admin/planner/schema.js";
import {
  getNewsletterCampaignById,
  updateNewsletterCampaignDraft
} from "../../../../../../features/dashboard/admin/planner/newsletterServices.js";
import Alert from "../../../../../../components/app/Alert.js";
const POST = createRoute(
  paramValidator(newsletterCampaignParamSchema),
  formValidator(newsletterCampaignEditSchema),
  async (c) => {
    const { campaignId } = c.req.valid("param");
    const form = c.req.valid("form");
    const campaign = await getNewsletterCampaignById(campaignId);
    if (!campaign) return c.html(/* @__PURE__ */ jsx(Fragment, {}));
    const isSent = campaign.status === "sent";
    const [error] = await updateNewsletterCampaignDraft(campaignId, {
      subject: form.subject,
      introText: form.introText,
      outroText: form.outroText,
      ctaText: form.ctaText,
      status: isSent ? "sent" : "draft",
      sentAt: isSent ? campaign.sentAt : null
    });
    if (error) return c.html(/* @__PURE__ */ jsx(Alert, { type: "danger", message: error.reason }));
    return c.html(/* @__PURE__ */ jsx(Alert, { type: "success", message: "Draft saved." }));
  }
);
export {
  POST
};
