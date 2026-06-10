import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../../lib/validator";
import { newsletterCampaignParamSchema } from "../../../../../../features/dashboard/admin/planner/schema";
import { sendNewsletterBrevoToList } from "../../../../../../features/dashboard/admin/planner/newsletterBrevoServices";
import {
  NewsletterBrevoPanel,
  NewsletterCampaignControls,
} from "../../../../../../features/dashboard/admin/planner/components/NewsletterCampaignSendPanels";
import Alert from "../../../../../../components/app/Alert";
import { getUser } from "../../../../../../utils";

export const POST = createRoute(
  paramValidator(newsletterCampaignParamSchema),
  async (c) => {
    const { campaignId } = c.req.valid("param");

    const [error, result] = await sendNewsletterBrevoToList(campaignId);

    if (error) {
      return c.html(<Alert type="danger" message={error.reason} />);
    }

    const user = await getUser(c);

    return c.html(
      <>
        <Alert
          type="success"
          message="Newsletter sent via Brevo to your configured list."
        />
        <NewsletterCampaignControls selectedCampaign={result.campaign} />
        <NewsletterBrevoPanel
          selectedCampaign={result.campaign}
          defaultTestEmail={user?.email ?? ""}
        />
      </>,
    );
  },
);
