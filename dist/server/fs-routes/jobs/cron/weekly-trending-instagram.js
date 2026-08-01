import { createRoute } from "hono-fsr";
import { runWeeklyTrendingInstagramCron } from "../../../jobs/cronRunners.js";
import { parseDateString } from "../../../lib/utils.js";
import { requireCronSecret } from "../../../jobs/cronRouteAuth.js";
const POST = createRoute(async (c) => {
  const unauthorized = requireCronSecret(c);
  if (unauthorized) return unauthorized;
  const dryRun = c.req.query("dryRun") === "1" || c.req.query("dryRun") === "true";
  const force = c.req.query("force") === "1" || c.req.query("force") === "true";
  const dateParam = c.req.query("date");
  const options = { dryRun, force };
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
export {
  POST
};
