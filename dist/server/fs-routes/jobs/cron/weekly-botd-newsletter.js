import { createRoute } from "hono-fsr";
import { runWeeklyNewsletterCron } from "../../../domain/planner/cron/newsletterCronServices.js";
import { parseDateString } from "../../../lib/utils.js";
const POST = createRoute(async (c) => {
  const secret = c.req.header("Authorization")?.replace(/^Bearer\s+/i, "") ?? c.req.query("secret");
  const expected = process.env.CRON_SECRET;
  if (!expected || secret !== expected) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const dryRun = c.req.query("dryRun") === "1" || c.req.query("dryRun") === "true";
  const force = c.req.query("force") === "1" || c.req.query("force") === "true";
  const weekStartParam = c.req.query("weekStart");
  let weekStart;
  if (weekStartParam) {
    weekStart = parseDateString(weekStartParam);
    if (Number.isNaN(weekStart.getTime())) {
      return c.json({ error: "Invalid weekStart (use YYYY-MM-DD)" }, 400);
    }
  }
  const [error, result] = await runWeeklyNewsletterCron({
    dryRun,
    weekStart,
    force
  });
  if (error) {
    return c.json({ error: error.reason }, 500);
  }
  return c.json({ ok: true, ...result });
});
export {
  POST
};
