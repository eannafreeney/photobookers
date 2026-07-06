import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../../lib/validator.js";
import { newsletterCampaignParamSchema } from "../../../../../../features/dashboard/admin/planner/schema.js";
import { deleteNewsletterCampaign } from "../../../../../../features/dashboard/admin/planner/newsletterServices.js";
import { setFlash } from "../../../../../../utils.js";
const POST = createRoute(
  paramValidator(newsletterCampaignParamSchema),
  async (c) => {
    const { campaignId } = c.req.valid("param");
    const [error] = await deleteNewsletterCampaign(campaignId);
    if (error) {
      await setFlash(c, "danger", error.reason);
      return c.redirect(
        `/dashboard/admin/planner/newsletters?campaignId=${campaignId}`
      );
    }
    await setFlash(c, "success", "Newsletter draft deleted.");
    return c.redirect("/dashboard/admin/planner/newsletters");
  }
);
export {
  POST
};
