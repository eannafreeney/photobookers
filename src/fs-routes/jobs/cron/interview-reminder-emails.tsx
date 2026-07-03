import { Context } from "hono";
import { createRoute } from "hono-fsr";
import { runInterviewReminderCron } from "../../../domain/interviews/reminderCron";
import { parseDateString } from "../../../lib/utils";

/**
 * Biweekly reminder for creators with an open interview invite.
 *
 * Sends every 14 days until the interview is submitted or the creator opts out.
 * Run weekly on Thursday; the 14-day cadence is enforced in code.
 *
 * Schedule externally, e.g. cron-job.org:
 *
 *   POST https://www.photobookers.com/jobs/cron/interview-reminder-emails
 *   Authorization: Bearer $CRON_SECRET
 *   Cron: 0 10 * * 4  (Thursdays 10:00 UTC)
 *
 * Optional query params:
 *   dryRun=1             — evaluate only, do not send
 *   force=1              — skip 14-day cadence (testing)
 *   to=email             — override recipient (testing)
 *   creatorId=uuid       — limit to one creator
 *   date=YYYY-MM-DD      — reference date for cadence guard
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

  const [error, result] = await runInterviewReminderCron({
    dryRun,
    force,
    to,
    creatorId,
    date,
  });
  if (error) {
    return c.json({ error: error.reason }, 500);
  }

  return c.json({ ok: true, ...result });
});
