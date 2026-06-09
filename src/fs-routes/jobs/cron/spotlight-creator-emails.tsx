import { Context } from "hono";
import { createRoute } from "hono-fsr";
import { runSpotlightCreatorEmails } from "../../../features/dashboard/admin/planner/spotlightEmailServices";
import { parseDateString, toWeekString } from "../../../lib/utils";

export const POST = createRoute(async (c: Context) => {
  const secret =
    c.req.header("Authorization")?.replace(/^Bearer\s+/i, "") ??
    c.req.query("secret");
  const expected = process.env.CRON_SECRET;
  if (!expected || secret !== expected) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const dateParam = c.req.query("date");
  const asOf = dateParam ? parseDateString(dateParam) : new Date();
  if (dateParam && Number.isNaN(asOf.getTime())) {
    return c.json({ error: "Invalid date (use YYYY-MM-DD)" }, 400);
  }

  const [error, result] = await runSpotlightCreatorEmails(asOf);
  if (error) {
    return c.json({ error: error.reason }, 500);
  }

  return c.json({
    ok: true,
    interviewRemindersSent: result.interviewRemindersSent,
    featureDayEmailsSent: result.featureDayEmailsSent,
    relatedNotifySent: result.relatedNotifySent,
    items: result.items.map((item) => ({
      ...item,
      weekStart: toWeekString(item.weekStart),
    })),
  });
});
