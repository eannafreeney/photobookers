import { Context } from "hono";
import { createRoute } from "hono-fsr";
import { ensureCurrentWeeklyNewsletterDraft } from "../../../features/dashboard/admin/planner/newsletterServices";

export const POST = createRoute(async (c: Context) => {
  const secret =
    c.req.header("Authorization")?.replace(/^Bearer\s+/i, "") ??
    c.req.query("secret");
  const expected = process.env.CRON_SECRET;
  if (!expected || secret !== expected) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const [draftError, campaign] = await ensureCurrentWeeklyNewsletterDraft();
  if (draftError || !campaign) {
    return c.json({ error: draftError?.reason ?? "Failed to prepare draft" }, 500);
  }

  return c.json({
    ok: true,
    campaignId: campaign.id,
    status: campaign.status,
  });
});
