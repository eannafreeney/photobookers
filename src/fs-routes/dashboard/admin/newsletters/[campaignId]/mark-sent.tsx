import { createRoute } from "hono-fsr";
import { formValidator, paramValidator } from "../../../../../lib/validator";
import {
  newsletterCampaignParamSchema,
  newsletterMarkSentSchema,
} from "../../../../../features/dashboard/admin/newsletters/schema";
import {
  getNewsletterCampaignById,
  updateNewsletterCampaignDraft,
} from "../../../../../features/dashboard/admin/newsletters/services";
import Alert from "../../../../../components/app/Alert";

export const POST = createRoute(
  paramValidator(newsletterCampaignParamSchema),
  formValidator(newsletterMarkSentSchema),
  async (c) => {
    const { campaignId } = c.req.valid("param");
    const { sent } = c.req.valid("form");
    const campaign = await getNewsletterCampaignById(campaignId);
    if (!campaign) return c.html(<></>);

    if (sent) {
      const [error] = await updateNewsletterCampaignDraft(campaign.id, {
        status: "sent",
        sentAt: new Date(),
      });
      if (error) return c.html(<Alert type="danger" message={error.reason} />);
      return c.html(<Alert type="success" message="Marked as sent." />);
    } else {
      const [error] = await updateNewsletterCampaignDraft(campaign.id, {
        status: "draft",
        sentAt: null,
      });
      if (error) return c.html(<Alert type="danger" message={error.reason} />);
      return c.html(<Alert type="success" message="Marked as not sent." />);
    }
  },
);
