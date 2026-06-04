import { Context } from "hono";
import { createRoute } from "hono-fsr";
import {
  queueDuePreparedInstagramPosts,
  queuePreparedBotdInstagramPostsForDate,
} from "../../../features/dashboard/admin/planner/instagramServices";
import { parseDateString } from "../../../lib/utils";

export const POST = createRoute(async (c: Context) => {
  const secret =
    c.req.header("Authorization")?.replace(/^Bearer\s+/i, "") ??
    c.req.query("secret");
  const expected = process.env.CRON_SECRET;
  if (!expected || secret !== expected) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const dateParam = c.req.query("date");
  let resultPromise;
  if (dateParam) {
    const targetDate = parseDateString(dateParam);
    if (Number.isNaN(targetDate.getTime())) {
      return c.json({ error: "Invalid date (use YYYY-MM-DD)" }, 400);
    }
    resultPromise = queuePreparedBotdInstagramPostsForDate(targetDate);
  } else {
    resultPromise = queueDuePreparedInstagramPosts();
  }

  const [error, result] = await resultPromise;
  if (error) {
    return c.json({ error: error.reason }, 500);
  }

  return c.json({
    ok: true,
    queued: result.queued,
    skipped: result.skipped,
  });
});
