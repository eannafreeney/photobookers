import { Context } from "hono";
import { createRoute } from "hono-fsr";
import {
  runDailyBotdInstagramCron,
  type CronRunnerOptions,
} from "@/jobs/cronRunners";
import { parseDateString, toUtcStartOfDay } from "../../../lib/utils";
import { requireCronSecret } from "@/jobs/cronRouteAuth";

/**
 * Queue prepared Instagram posts for one UTC day (default: today).
 *
 * Prefer GitHub Actions: npx tsx scripts/cron/run.ts daily-botd-instagram
 *
 * Optional query: date=YYYY-MM-DD, allPrepared=1
 */
export const POST = createRoute(async (c: Context) => {
  const unauthorized = requireCronSecret(c);
  if (unauthorized) return unauthorized;

  const dateParam = c.req.query("date");
  const allPrepared =
    c.req.query("allPrepared") === "1" || c.req.query("allPrepared") === "true";

  const options: CronRunnerOptions = { allPrepared };
  if (dateParam) {
    const targetDate = parseDateString(dateParam);
    if (Number.isNaN(targetDate.getTime())) {
      return c.json({ error: "Invalid date (use YYYY-MM-DD)" }, 400);
    }
    options.date = targetDate;
  } else if (!allPrepared) {
    options.date = toUtcStartOfDay(new Date());
  }

  const [error, result] = await runDailyBotdInstagramCron(options);
  if (error) return c.json({ error: error.reason }, 500);
  return c.json({ ok: true, ...result });
});
