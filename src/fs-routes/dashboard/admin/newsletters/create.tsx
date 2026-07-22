import { createRoute } from "hono-fsr";
import { ensureNextNewsletterDraftAfterLatest } from "../../../../features/dashboard/admin/newsletters/services";
import { setFlash } from "../../../../utils";

export const POST = createRoute(async (c) => {
  const [error, campaign] = await ensureNextNewsletterDraftAfterLatest();

  if (error || !campaign) {
    await setFlash(c, "danger", error?.reason ?? "Failed to create newsletter.");
    return c.redirect("/dashboard/admin/newsletters");
  }

  return c.redirect(`/dashboard/admin/newsletters/${campaign.id}`);
});
