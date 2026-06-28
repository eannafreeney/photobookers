import { Context } from "hono";
import { createRoute } from "hono-fsr";
import { runInstagramPrepReminderEmail } from "../../../domain/planner/cron/instagramReminderEmailServices";
import { parseDateString, toWeekString } from "../../../lib/utils";

/**
 * Emails the admin when Instagram posts are not prepared two days before week start.
 *
 * Schedule weekly on Saturday, e.g. Render cron at 09:00 UTC:
 *
 *   POST https://www.photobookers.com/jobs/cron/instagram-prep-reminder-email
 *   Authorization: Bearer $CRON_SECRET
 *   Cron: 0 9 * * 6
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

  const [error, result] = await runInstagramPrepReminderEmail(asOf);
  if (error) {
    return c.json({ error: error.reason }, 500);
  }

  return c.json({
    ok: true,
    reminderEmailSent: result.reminderEmailSent,
    weekStart: result.weekStart ? toWeekString(result.weekStart) : null,
    gaps: result.gaps.map((gap) =>
      gap.kind === "botd"
        ? { kind: gap.kind, date: gap.date.toISOString().slice(0, 10) }
        : { kind: gap.kind },
    ),
    outcome: result.outcome,
  });
});
