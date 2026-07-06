import { Context } from "hono";
import { createRoute } from "hono-fsr";
import { runWeeklyBotdNewsletterCron } from "@/jobs/cronRunners";
import { parseDateString } from "../../../lib/utils";
import { requireCronSecret } from "@/jobs/cronRouteAuth";

/**
 * Weekly BOTD newsletter cron.
 *
 * Prefer GitHub Actions: npx tsx scripts/cron/run.ts weekly-botd-newsletter
 *
 * Optional query: dryRun=1, weekStart=YYYY-MM-DD, force=1
 */
export const POST = createRoute(async (c: Context) => {
  const unauthorized = requireCronSecret(c);
  if (unauthorized) return unauthorized;

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

  const [error, result] = await runWeeklyBotdNewsletterCron({
    dryRun,
    weekStart,
    force,
  });
  if (error) return c.json({ error: error.reason }, 500);
  return c.json({ ok: true, ...result });
});
