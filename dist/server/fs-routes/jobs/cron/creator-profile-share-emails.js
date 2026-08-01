import { createRoute } from "hono-fsr";
import { runCreatorProfileShareCron } from "../../../domain/creator-profile-share/cron.js";
import { parseDateString } from "../../../lib/utils.js";
import { requireCronSecret } from "../../../jobs/cronRouteAuth.js";
const POST = createRoute(async (c) => {
  const unauthorized = requireCronSecret(c);
  if (unauthorized) return unauthorized;
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
  const [error, result] = await runCreatorProfileShareCron({
    dryRun,
    to,
    creatorId,
    date
  });
  if (error) return c.json({ error: error.reason }, 500);
  return c.json({ ok: true, ...result });
});
export {
  POST
};
