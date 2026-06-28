import { Context } from "hono";
import { createRoute } from "hono-fsr";
import { runWeeklyNewsletterCron } from "../../../domain/planner/cron/newsletterCronServices";
import { parseDateString } from "../../../lib/utils";

/**
 * Weekly BOTD newsletter cron.
 *
 * Sends on Wednesday with Thu–Wed books (7 days ending today).
 * Schedule externally, e.g. cron-job.org:
 *
 *   POST https://www.photobookers.com/jobs/cron/weekly-botd-newsletter
 *   Authorization: Bearer $CRON_SECRET
 *   Cron: 0 9 * * 3  (Wednesday 09:00 UTC)
 *
 * Optional query params:
 *   dryRun=1             — build/regenerate only, do not send
 *   weekStart=YYYY-MM-DD — Thursday range-start (for backfill/testing)
 *   force=1              — send on a non-Wednesday
 */
export const POST = createRoute(async (c: Context) => {
  const secret =
    c.req.header("Authorization")?.replace(/^Bearer\s+/i, "") ??
    c.req.query("secret");
  const expected = process.env.CRON_SECRET;
  if (!expected || secret !== expected) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const dryRun =
    c.req.query("dryRun") === "1" || c.req.query("dryRun") === "true";
  const force = c.req.query("force") === "1" || c.req.query("force") === "true";
  const weekStartParam = c.req.query("weekStart");
  let weekStart: Date | undefined;
  if (weekStartParam) {
    weekStart = parseDateString(weekStartParam);
    if (Number.isNaN(weekStart.getTime())) {
      return c.json({ error: "Invalid weekStart (use YYYY-MM-DD)" }, 400);
    }
  }

  const [error, result] = await runWeeklyNewsletterCron({
    dryRun,
    weekStart,
    force,
  });
  if (error) {
    return c.json({ error: error.reason }, 500);
  }

  return c.json({ ok: true, ...result });
});
