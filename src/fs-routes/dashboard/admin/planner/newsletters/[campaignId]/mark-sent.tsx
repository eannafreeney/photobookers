import { createRoute } from "hono-fsr";
import { formValidator, paramValidator } from "../../../../../../lib/validator";
import {
  newsletterCampaignParamSchema,
  newsletterMarkSentSchema,
} from "../../../../../../features/dashboard/admin/planner/schema";
import {
  getNewsletterCampaignById,
  updateNewsletterCampaignDraft,
} from "../../../../../../features/dashboard/admin/planner/newsletterServices";
import { setFlash } from "../../../../../../utils";

export const POST = createRoute(
  paramValidator(newsletterCampaignParamSchema),
  formValidator(newsletterMarkSentSchema),
  async (c) => {
    const { campaignId } = c.req.valid("param");
    const { sent } = c.req.valid("form");
    const campaign = await getNewsletterCampaignById(campaignId);
    if (!campaign) return c.redirect("/dashboard/admin/planner/newsletters");

    if (sent) {
      await updateNewsletterCampaignDraft(campaign.id, {
        status: "sent",
        sentAt: new Date(),
      });
      await setFlash(c, "success", "Marked as sent.");
    } else {
      await updateNewsletterCampaignDraft(campaign.id, {
        status: "draft",
        sentAt: null,
      });
      await setFlash(c, "success", "Marked as not sent.");
    }

    return c.redirect(
      `/dashboard/admin/planner/newsletters?campaignId=${campaignId}`,
    );
  },
);
