import { createRoute } from "hono-fsr";
import { formValidator, paramValidator } from "../../../../../../lib/validator";
import {
  newsletterBrevoTestSchema,
  newsletterCampaignParamSchema,
} from "../../../../../../features/dashboard/admin/planner/schema";
import { sendNewsletterBrevoTest } from "../../../../../../features/dashboard/admin/planner/newsletter/brevoServices";
import Alert from "../../../../../../components/app/Alert";

export const POST = createRoute(
  paramValidator(newsletterCampaignParamSchema),
  formValidator(newsletterBrevoTestSchema),
  async (c) => {
    const { campaignId } = c.req.valid("param");
    const { email } = c.req.valid("form");

    const [error, result] = await sendNewsletterBrevoTest(
      campaignId,
      email || undefined,
    );

    if (error) {
      return c.html(<Alert type="danger" message={error.reason} />);
    }

    return c.html(
      <Alert
        type="success"
        message={`Brevo test email sent to ${result.recipient}.`}
      />,
    );
  },
);
