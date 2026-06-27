import { Context } from "hono";
import { createRoute } from "hono-fsr";
import { runCreatorAnalyticsDigestCron } from "../../../features/creator-analytics-digest/services";
import { parseDateString } from "../../../lib/utils";

/**
 * Monthly creator analytics digest cron.
 *
 * Sends on the 3rd of each month for the previous calendar month.
 * Schedule externally, e.g. cron-job.org:
 *
 *   POST https://www.photobookers.com/jobs/cron/creator-analytics-digest
 *   Authorization: Bearer $CRON_SECRET
 *   Cron: 0 9 3 * *  (3rd of each month, 09:00 UTC)
 *
 * Optional query params:
 *   dryRun=1             — build only, do not send
 *   month=YYYY-MM        — report period override
 *   force=1              — send even when not the 3rd
 *   to=email             — override recipient (testing)
 *   creatorId=uuid       — limit to one creator
 *   date=YYYY-MM-DD      — reference date for month calc / guards
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
  const to = c.req.query("to") ?? undefined;
  const creatorId = c.req.query("creatorId") ?? undefined;
  const month = c.req.query("month") ?? undefined;
  const dateParam = c.req.query("date");
  let date: Date | undefined;
  if (dateParam) {
    date = parseDateString(dateParam);
    if (Number.isNaN(date.getTime())) {
      return c.json({ error: "Invalid date (use YYYY-MM-DD)" }, 400);
    }
  }

  const [error, result] = await runCreatorAnalyticsDigestCron({
    dryRun,
    force,
    to,
    creatorId,
    month,
    date,
  });
  if (error) {
    return c.json({ error: error.reason }, 500);
  }

  return c.json({ ok: true, ...result });
});
