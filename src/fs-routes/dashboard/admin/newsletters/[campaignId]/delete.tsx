import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../lib/validator";
import { newsletterCampaignParamSchema } from "../../../../../features/dashboard/admin/newsletters/schema";
import { deleteNewsletterCampaign } from "../../../../../features/dashboard/admin/newsletters/services";
import { setFlash } from "../../../../../utils";

export const POST = createRoute(
  paramValidator(newsletterCampaignParamSchema),
  async (c) => {
    const { campaignId } = c.req.valid("param");
    const [error] = await deleteNewsletterCampaign(campaignId);
    if (error) {
      await setFlash(c, "danger", error.reason);
      return c.redirect(`/dashboard/admin/newsletters/${campaignId}`);
    }
    await setFlash(c, "success", "Newsletter draft deleted.");
    return c.redirect("/dashboard/admin/newsletters");
  },
);
