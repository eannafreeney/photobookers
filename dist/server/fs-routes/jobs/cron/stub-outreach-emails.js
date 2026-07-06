import { createRoute } from "hono-fsr";
import { runStubOutreachCron } from "../../../features/stub-outreach/services.js";
import { parseDateString } from "../../../lib/utils.js";
const POST = createRoute(async (c) => {
  const secret = c.req.header("Authorization")?.replace(/^Bearer\s+/i, "") ?? c.req.query("secret");
  const expected = process.env.CRON_SECRET;
  if (!expected || secret !== expected) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const dryRun = c.req.query("dryRun") === "1" || c.req.query("dryRun") === "true";
  const to = c.req.query("to") ?? void 0;
  const creatorId = c.req.query("creatorId") ?? void 0;
  const dateParam = c.req.query("date");
  let date;
  if (dateParam) {
    date = parseDateString(dateParam);
    if (Number.isNaN(date.getTime())) {
      return c.json({ error: "Invalid date (use YYYY-MM-DD)" }, 400);
    }
  }
  const [error, result] = await runStubOutreachCron({
    dryRun,
    to,
    creatorId,
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
