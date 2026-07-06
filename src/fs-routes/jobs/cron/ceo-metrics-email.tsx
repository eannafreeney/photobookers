import { Context } from "hono";
import { createRoute } from "hono-fsr";
import { runCeoMetricsEmailCronJob } from "@/jobs/cronRunners";
import { parseDateString } from "../../../lib/utils";
import { requireCronSecret } from "@/jobs/cronRouteAuth";

/**
 * Weekly CEO metrics email cron.
 *
 * Prefer GitHub Actions: npx tsx scripts/cron/run.ts ceo-metrics-email
 *
 * Optional query: dryRun=1, force=1, date=YYYY-MM-DD
 */
export const POST = createRoute(async (c: Context) => {
  const unauthorized = requireCronSecret(c);
  if (unauthorized) return unauthorized;

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

  const [error, result] = await runCeoMetricsEmailCronJob({ dryRun, force, date });
  if (error) return c.json({ error: error.reason }, 500);
  return c.json({ ok: true, ...result });
});
