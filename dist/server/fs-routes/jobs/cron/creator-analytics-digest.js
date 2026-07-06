import { createRoute } from "hono-fsr";
import { runCreatorAnalyticsDigestCron } from "../../../features/creator-analytics-digest/services.js";
import { parseDateString } from "../../../lib/utils.js";
const POST = createRoute(async (c) => {
  const secret = c.req.header("Authorization")?.replace(/^Bearer\s+/i, "");
  const expected = process.env.CRON_SECRET;
  if (!expected || secret !== expected) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const dryRun = c.req.query("dryRun") === "1" || c.req.query("dryRun") === "true";
  const force = c.req.query("force") === "1" || c.req.query("force") === "true";
  const to = c.req.query("to") ?? void 0;
  const creatorId = c.req.query("creatorId") ?? void 0;
  const month = c.req.query("month") ?? void 0;
  const dateParam = c.req.query("date");
  let date;
  if (dateParam) {
    date = parseDateString(dateParam);
    if (Number.isNaN(date.getTime())) {
      return c.json({ error: "Invalid date (use YYYY-MM-DD)" }, 400);
    }
  }
  const [error, result] = await runCreatorAnalyticsDigestCron({
    dryRun,
    force,
    to,
    creatorId,
    month,
    date
  });
  if (error) {
    return c.json({ error: error.reason }, 500);
  }
  return c.json({ ok: true, ...result });
});
export {
  POST
};
