import { Context } from "hono";
import { createRoute } from "hono-fsr";
import { runBotdAdvanceNotificationEmails } from "../../../domain/planner/cron/botdEmailServices";
import { parseDateString, toDateString } from "../../../lib/utils";

/**
 * Sends BOTD advance notification emails for features exactly one week away.
 *
 * Schedule daily, e.g. Render cron at 09:00 UTC:
 *
 *   POST https://www.photobookers.com/jobs/cron/botd-advance-notification-emails
 *   Authorization: Bearer $CRON_SECRET
 *
 * Optional query: date=YYYY-MM-DD — treat this as "today" (for backfill/testing).
 */
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

  const [error, result] = await runBotdAdvanceNotificationEmails(asOf);
  if (error) {
    return c.json({ error: error.reason }, 500);
  }

  return c.json({
    ok: true,
    advanceEmailsSent: result.advanceEmailsSent,
    featureDate: result.featureDate ? toDateString(result.featureDate) : null,
    items: result.items.map((item) => ({
      ...item,
      date: toDateString(item.date),
    })),
  });
});
