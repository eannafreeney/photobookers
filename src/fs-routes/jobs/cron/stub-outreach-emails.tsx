import { Context } from "hono";
import { createRoute } from "hono-fsr";
import { runStubOutreachCron } from "../../../features/stub-outreach/services";
import { parseDateString } from "../../../lib/utils";

/**
 * Daily stub creator outreach cron.
 *
 * Sends welcome emails for new stubs, then view-milestone activity emails
 * at 50 / 100 / 150 all-time views.
 *
 * Schedule externally, e.g. cron-job.org:
 *
 *   POST https://www.photobookers.com/jobs/cron/stub-outreach-emails
 *   Authorization: Bearer $CRON_SECRET
 *   Cron: 0 10 * * *  (daily 10:00 UTC)
 *
 * Optional query params:
 *   dryRun=1             — evaluate only, do not send
 *   to=email             — override recipient (testing)
 *   creatorId=uuid       — limit to one creator
 *   date=YYYY-MM-DD      — reference date for grace/cooldown guards
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
  const to = c.req.query("to") ?? undefined;
  const creatorId = c.req.query("creatorId") ?? undefined;
  const dateParam = c.req.query("date");
  let date: Date | undefined;
  if (dateParam) {
    date = parseDateString(dateParam);
    if (Number.isNaN(date.getTime())) {
      return c.json({ error: "Invalid date (use YYYY-MM-DD)" }, 400);
    }
  }

  const [error, result] = await runStubOutreachCron({
    dryRun,
    to,
    creatorId,
    date,
  });
  if (error) {
    return c.json({ error: error.reason }, 500);
  }

  return c.json({ ok: true, ...result });
});
