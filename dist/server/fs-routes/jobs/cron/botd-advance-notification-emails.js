import { createRoute } from "hono-fsr";
import { runBotdAdvanceNotificationEmails } from "../../../domain/planner/cron/botdEmailServices.js";
import { parseDateString, toDateString } from "../../../lib/utils.js";
const POST = createRoute(async (c) => {
  const secret = c.req.header("Authorization")?.replace(/^Bearer\s+/i, "") ?? c.req.query("secret");
  const expected = process.env.CRON_SECRET;
  if (!expected || secret !== expected) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const dateParam = c.req.query("date");
  const asOf = dateParam ? parseDateString(dateParam) : /* @__PURE__ */ new Date();
  if (dateParam && Number.isNaN(asOf.getTime())) {
    return c.json({ error: "Invalid date (use YYYY-MM-DD)" }, 400);
  }
  const [error, result] = await runBotdAdvanceNotificationEmails(asOf);
  if (error) {
    return c.json({ error: error.reason }, 500);
  }
  return c.json({
    ok: true,
    advanceEmailsSent: result.advanceEmailsSent,
    featureDate: result.featureDate ? toDateString(result.featureDate) : null,
    items: result.items.map((item) => ({
      ...item,
      date: toDateString(item.date)
    }))
  });
});
export {
  POST
};
