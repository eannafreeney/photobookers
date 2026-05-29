import { createRoute } from "hono-fsr";
import { formValidator, paramValidator } from "../../../../../../lib/validator";
import {
  newsletterCampaignEditSchema,
  newsletterCampaignParamSchema,
} from "../../../../../../features/dashboard/admin/planner/schema";
import {
  getNewsletterCampaignById,
  updateNewsletterCampaignDraft,
} from "../../../../../../features/dashboard/admin/planner/newsletterServices";
import Alert from "../../../../../../components/app/Alert";

export const POST = createRoute(
  paramValidator(newsletterCampaignParamSchema),
  formValidator(newsletterCampaignEditSchema),
  async (c) => {
    const { campaignId } = c.req.valid("param");
    const form = c.req.valid("form");
    const campaign = await getNewsletterCampaignById(campaignId);
    if (!campaign) return c.html(<></>);

    const isSent = campaign.status === "sent";
    const [error] = await updateNewsletterCampaignDraft(campaignId, {
      subject: form.subject,
      introText: form.introText,
      outroText: form.outroText,
      ctaText: form.ctaText,
      status: isSent ? "sent" : "draft",
      sentAt: isSent ? campaign.sentAt : null,
    });

    if (error) return c.html(<Alert type="danger" message={error.reason} />);

    return c.html(<Alert type="success" message="Draft saved." />);
  },
);
