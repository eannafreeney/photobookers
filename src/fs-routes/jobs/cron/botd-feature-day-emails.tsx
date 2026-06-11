import { Context } from "hono";
import { createRoute } from "hono-fsr";
import { runBotdFeatureDayEmails } from "../../../features/dashboard/admin/planner/botdEmailServices";
import { parseDateString, toDateString } from "../../../lib/utils";

export const POST = createRoute(async (c: Context) => {
  const secret =
    c.req.header("Authorization")?.replace(/^Bearer\s+/i, "") ??
    c.req.query("secret");
  const expected = process.env.CRON_SECRET;
  if (!expected || secret !== expected) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const dateParam = c.req.query("date");
  const asOf = dateParam ? parseDateString(dateParam) : new Date();
  if (dateParam && Number.isNaN(asOf.getTime())) {
    return c.json({ error: "Invalid date (use YYYY-MM-DD)" }, 400);
  }

  const [error, result] = await runBotdFeatureDayEmails(asOf);
  if (error) {
    return c.json({ error: error.reason }, 500);
  }

  return c.json({
    ok: true,
    featureDayEmailsSent: result.featureDayEmailsSent,
    items: result.items.map((item) => ({
      ...item,
      date: toDateString(item.date),
    })),
  });
});
