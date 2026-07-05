import { Context } from "hono";
import { createRoute } from "hono-fsr";
import { runCeoMetricsEmailCron } from "../../../domain/ceo-metrics/cron";
import { parseDateString } from "../../../lib/utils";

/**
 * Weekly CEO metrics email cron.
 *
 * Schedule externally on Monday mornings, e.g. cron-job.org:
 *
 *   POST https://www.photobookers.com/jobs/cron/ceo-metrics-email
 *   Authorization: Bearer $CRON_SECRET
 *   Cron: 0 8 * * 1  (Mondays, 08:00 UTC)
 *
 * Optional query params:
 *   dryRun=1   — build metrics only, do not send
 *   force=1    — send even when not Monday
 *   date=YYYY-MM-DD — reference date for Monday guard
 */
export const POST = createRoute(async (c: Context) => {
  const secret = c.req.header("Authorization")?.replace(/^Bearer\s+/i, "");
  const expected = process.env.CRON_SECRET;
  if (!expected || secret !== expected) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const dryRun =
    c.req.query("dryRun") === "1" || c.req.query("dryRun") === "true";
  const force = c.req.query("force") === "1" || c.req.query("force") === "true";
  const dateParam = c.req.query("date");
  let date: Date | undefined;
  if (dateParam) {
    date = parseDateString(dateParam);
    if (Number.isNaN(date.getTime())) {
      return c.json({ error: "Invalid date (use YYYY-MM-DD)" }, 400);
    }
  }

  const [error, result] = await runCeoMetricsEmailCron({ dryRun, force, date });
  if (error) {
    return c.json({ error: error.reason }, 500);
  }

  return c.json({ ok: true, ...result });
});
