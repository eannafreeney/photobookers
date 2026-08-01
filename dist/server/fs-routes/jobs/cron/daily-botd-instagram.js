import { createRoute } from "hono-fsr";
import {
  runDailyBotdInstagramCron
} from "../../../jobs/cronRunners.js";
import { parseDateString, toUtcStartOfDay } from "../../../lib/utils.js";
import { requireCronSecret } from "../../../jobs/cronRouteAuth.js";
const POST = createRoute(async (c) => {
  const unauthorized = requireCronSecret(c);
  if (unauthorized) return unauthorized;
  const dateParam = c.req.query("date");
  const allPrepared = c.req.query("allPrepared") === "1" || c.req.query("allPrepared") === "true";
  const options = { allPrepared };
  if (dateParam) {
    const targetDate = parseDateString(dateParam);
    if (Number.isNaN(targetDate.getTime())) {
      return c.json({ error: "Invalid date (use YYYY-MM-DD)" }, 400);
    }
    options.date = targetDate;
  } else if (!allPrepared) {
    options.date = toUtcStartOfDay(/* @__PURE__ */ new Date());
  }
  const [error, result] = await runDailyBotdInstagramCron(options);
  if (error) return c.json({ error: error.reason }, 500);
  return c.json({ ok: true, ...result });
});
export {
  POST
};
