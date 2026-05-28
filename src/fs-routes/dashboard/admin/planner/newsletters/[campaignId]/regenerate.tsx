import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../../lib/validator";
import { newsletterCampaignParamSchema } from "../../../../../../features/dashboard/admin/planner/schema";
import { regenerateCampaignContent } from "../../../../../../features/dashboard/admin/planner/newsletterServices";

export const POST = createRoute(
  paramValidator(newsletterCampaignParamSchema),
  async (c) => {
    const { campaignId } = c.req.valid("param");
    await regenerateCampaignContent(campaignId);
    return c.redirect(`/dashboard/admin/planner/newsletters?campaignId=${campaignId}`);
  },
);
