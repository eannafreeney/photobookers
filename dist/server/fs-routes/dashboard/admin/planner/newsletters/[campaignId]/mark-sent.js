import { Fragment, jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { formValidator, paramValidator } from "../../../../../../lib/validator.js";
import {
  newsletterCampaignParamSchema,
  newsletterMarkSentSchema
} from "../../../../../../features/dashboard/admin/planner/schema.js";
import {
  getNewsletterCampaignById,
  updateNewsletterCampaignDraft
} from "../../../../../../features/dashboard/admin/planner/newsletterServices.js";
import Alert from "../../../../../../components/app/Alert.js";
const POST = createRoute(
  paramValidator(newsletterCampaignParamSchema),
  formValidator(newsletterMarkSentSchema),
  async (c) => {
    const { campaignId } = c.req.valid("param");
    const { sent } = c.req.valid("form");
    const campaign = await getNewsletterCampaignById(campaignId);
    if (!campaign) return c.html(/* @__PURE__ */ jsx(Fragment, {}));
    if (sent) {
      const [error] = await updateNewsletterCampaignDraft(campaign.id, {
        status: "sent",
        sentAt: /* @__PURE__ */ new Date()
      });
      if (error) return c.html(/* @__PURE__ */ jsx(Alert, { type: "danger", message: error.reason }));
      return c.html(/* @__PURE__ */ jsx(Alert, { type: "success", message: "Marked as sent." }));
    } else {
      const [error] = await updateNewsletterCampaignDraft(campaign.id, {
        status: "draft",
        sentAt: null
      });
      if (error) return c.html(/* @__PURE__ */ jsx(Alert, { type: "danger", message: error.reason }));
      return c.html(/* @__PURE__ */ jsx(Alert, { type: "success", message: "Marked as not sent." }));
    }
  }
);
export {
  POST
};
