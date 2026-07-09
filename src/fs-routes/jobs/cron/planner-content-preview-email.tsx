import { Context } from "hono";
import { createRoute } from "hono-fsr";
import { runPlannerContentPreviewEmailCron } from "@/jobs/cronRunners";
import { parseDateString } from "../../../lib/utils";
import { requireCronSecret } from "@/jobs/cronRouteAuth";

/** Prefer GitHub Actions: npx tsx scripts/cron/run.ts planner-content-preview-email */
export const POST = createRoute(async (c: Context) => {
  const unauthorized = requireCronSecret(c);
  if (unauthorized) return unauthorized;

  const dateParam = c.req.query("date");
  const weekStartParam = c.req.query("weekStart");
  const options: {
    date?: Date;
    weekStart?: Date;
    dryRun?: boolean;
    force?: boolean;
  } = {};

  if (dateParam) {
    const date = parseDateString(dateParam);
    if (Number.isNaN(date.getTime())) {
      return c.json({ error: "Invalid date (use YYYY-MM-DD)" }, 400);
    }
    options.date = date;
  }

  if (weekStartParam) {
    const weekStart = parseDateString(weekStartParam);
    if (Number.isNaN(weekStart.getTime())) {
      return c.json({ error: "Invalid weekStart (use YYYY-MM-DD)" }, 400);
    }
    options.weekStart = weekStart;
  }

  if (c.req.query("dryRun") === "1") options.dryRun = true;
  if (c.req.query("force") === "1") options.force = true;

  const [error, result] = await runPlannerContentPreviewEmailCron(options);
  if (error) return c.json({ error: error.reason }, 500);
  return c.json({ ok: true, ...result });
});
