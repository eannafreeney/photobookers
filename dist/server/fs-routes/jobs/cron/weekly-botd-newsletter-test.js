import { createRoute } from "hono-fsr";
import { runWeeklyBotdNewsletterTestCron } from "../../../jobs/cronRunners.js";
import { parseDateString } from "../../../lib/utils.js";
import { requireCronSecret } from "../../../jobs/cronRouteAuth.js";
const POST = createRoute(async (c) => {
  const unauthorized = requireCronSecret(c);
  if (unauthorized) return unauthorized;
  const dryRun = c.req.query("dryRun") === "1" || c.req.query("dryRun") === "true";
  const force = c.req.query("force") === "1" || c.req.query("force") === "true";
  const to = c.req.query("to")?.trim() || void 0;
  const weekStartParam = c.req.query("weekStart");
  let weekStart;
  if (weekStartParam) {
    weekStart = parseDateString(weekStartParam);
    if (Number.isNaN(weekStart.getTime())) {
      return c.json({ error: "Invalid weekStart (use YYYY-MM-DD)" }, 400);
    }
  }
  const [error, result] = await runWeeklyBotdNewsletterTestCron({
    dryRun,
    weekStart,
    force,
    to
  });
  if (error) return c.json({ error: error.reason }, 500);
  return c.json({ ok: true, ...result });
});
export {
  POST
};
