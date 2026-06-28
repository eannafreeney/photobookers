import { Context } from "hono";
import { createRoute } from "hono-fsr";
import { runSpotlightCreatorEmails } from "../../../domain/planner/cron/spotlightEmailServices";
import { parseDateString, toWeekString } from "../../../lib/utils";

export const POST = createRoute(async (c: Context) => {
  const secret =
    c.req.header("Authorization")?.replace(/^Bearer\s+/i, "") ??
    c.req.query("secret");
  const CRON_SECRET = process.env.CRON_SECRET;
  if (!CRON_SECRET || secret !== CRON_SECRET) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const dateParam = c.req.query("date");
  const date = dateParam ? parseDateString(dateParam) : new Date();
  if (dateParam && Number.isNaN(date.getTime())) {
    return c.json({ error: "Invalid date (use YYYY-MM-DD)" }, 400);
  }

  const [error, result] = await runSpotlightCreatorEmails(date);
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
