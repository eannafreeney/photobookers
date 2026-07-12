import { Context } from "hono";
import { createRoute } from "hono-fsr";
import { runWeeklyTrendingInstagramCron } from "@/jobs/cronRunners";
import { parseDateString } from "../../../lib/utils";
import { requireCronSecret } from "@/jobs/cronRouteAuth";

/** Prefer GitHub Actions: npx tsx scripts/cron/run.ts weekly-trending-instagram */
export const POST = createRoute(async (c: Context) => {
  const unauthorized = requireCronSecret(c);
  if (unauthorized) return unauthorized;

  const dryRun =
    c.req.query("dryRun") === "1" || c.req.query("dryRun") === "true";
  const force = c.req.query("force") === "1" || c.req.query("force") === "true";
  const dateParam = c.req.query("date");

  const options: {
    dryRun?: boolean;
    force?: boolean;
    date?: Date;
  } = { dryRun, force };

  if (dateParam) {
    const targetDate = parseDateString(dateParam);
    if (Number.isNaN(targetDate.getTime())) {
      return c.json({ error: "Invalid date (use YYYY-MM-DD)" }, 400);
    }
    options.date = targetDate;
  }

  const [error, result] = await runWeeklyTrendingInstagramCron(options);
  if (error) return c.json({ error: error.reason }, 500);
  return c.json({ ok: true, ...result });
});
