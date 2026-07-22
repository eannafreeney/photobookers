import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../lib/validator";
import { newsletterCampaignParamSchema } from "../../../../../features/dashboard/admin/newsletters/schema";
import { regenerateCampaignContent } from "../../../../../features/dashboard/admin/newsletters/services";
import Alert from "../../../../../components/app/Alert";

export const POST = createRoute(
  paramValidator(newsletterCampaignParamSchema),
  async (c) => {
    const { campaignId } = c.req.valid("param");
    const [error, generated] = await regenerateCampaignContent(campaignId);

    if (error) {
      return c.html(<Alert type="danger" message={error.reason} />);
    }
    const itemCount = generated?.botdEntries.length ?? 0;

    return c.html(
      <Alert
        type="success"
        message={`Regenerated ${itemCount} BOTD item${itemCount === 1 ? "" : "s"}.`}
      />,
    );
  },
);
