import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../../lib/validator";
import { newsletterCampaignParamSchema } from "../../../../../../features/dashboard/admin/planner/schema";
import { deleteNewsletterCampaign } from "../../../../../../features/dashboard/admin/planner/newsletter/services";
import { setFlash } from "../../../../../../utils";

export const POST = createRoute(
  paramValidator(newsletterCampaignParamSchema),
  async (c) => {
    const { campaignId } = c.req.valid("param");
    const [error] = await deleteNewsletterCampaign(campaignId);
    if (error) {
      await setFlash(c, "danger", error.reason);
      return c.redirect(
        `/dashboard/admin/planner/newsletters?campaignId=${campaignId}`,
      );
    }
    await setFlash(c, "success", "Newsletter draft deleted.");
    return c.redirect("/dashboard/admin/planner/newsletters");
  },
);
