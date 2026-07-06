import { Context } from "hono";
import { createRoute } from "hono-fsr";
import { runInstagramPrepReminderEmailCron } from "@/jobs/cronRunners";
import { parseDateString } from "../../../lib/utils";
import { requireCronSecret } from "@/jobs/cronRouteAuth";

/** Prefer GitHub Actions: npx tsx scripts/cron/run.ts instagram-prep-reminder-email */
export const POST = createRoute(async (c: Context) => {
  const unauthorized = requireCronSecret(c);
  if (unauthorized) return unauthorized;

  const dateParam = c.req.query("date");
  if (dateParam) {
    const date = parseDateString(dateParam);
    if (Number.isNaN(date.getTime())) {
      return c.json({ error: "Invalid date (use YYYY-MM-DD)" }, 400);
    }
    const [error, result] = await runInstagramPrepReminderEmailCron({ date });
    if (error) return c.json({ error: error.reason }, 500);
    return c.json({ ok: true, ...result });
  }

  const [error, result] = await runInstagramPrepReminderEmailCron();
  if (error) return c.json({ error: error.reason }, 500);
  return c.json({ ok: true, ...result });
});
