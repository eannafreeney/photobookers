import { createRoute } from "hono-fsr";
import { runInstagramPrepReminderEmailCron } from "../../../jobs/cronRunners.js";
import { parseDateString } from "../../../lib/utils.js";
import { requireCronSecret } from "../../../jobs/cronRouteAuth.js";
const POST = createRoute(async (c) => {
  const unauthorized = requireCronSecret(c);
  if (unauthorized) return unauthorized;
  const dateParam = c.req.query("date");
  if (dateParam) {
    const date = parseDateString(dateParam);
    if (Number.isNaN(date.getTime())) {
      return c.json({ error: "Invalid date (use YYYY-MM-DD)" }, 400);
    }
    const [error2, result2] = await runInstagramPrepReminderEmailCron({ date });
    if (error2) return c.json({ error: error2.reason }, 500);
    return c.json({ ok: true, ...result2 });
  }
  const [error, result] = await runInstagramPrepReminderEmailCron();
  if (error) return c.json({ error: error.reason }, 500);
  return c.json({ ok: true, ...result });
});
export {
  POST
};
