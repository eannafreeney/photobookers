import { Context } from "hono";
import { createRoute } from "hono-fsr";
import { runVerificationFeedbackCron } from "../../../domain/verification-feedback/cron";
import { parseDateString } from "../../../lib/utils";

/** Prefer GitHub Actions: npx tsx scripts/cron/run.ts verification-feedback-emails */
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
  const userId = c.req.query("userId") ?? undefined;
  const creatorId = c.req.query("creatorId") ?? undefined;
  const dateParam = c.req.query("date");
  let date: Date | undefined;
  if (dateParam) {
    date = parseDateString(dateParam);
    if (Number.isNaN(date.getTime())) {
      return c.json({ error: "Invalid date (use YYYY-MM-DD)" }, 400);
    }
  }

  const [error, result] = await runVerificationFeedbackCron({
    dryRun,
    force,
    to,
    userId,
    creatorId,
    date,
  });
  if (error) {
    return c.json({ error: error.reason }, 500);
  }

  return c.json({ ok: true, ...result });
});
