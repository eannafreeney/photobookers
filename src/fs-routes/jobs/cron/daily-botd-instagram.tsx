import { Context } from "hono";
import { createRoute } from "hono-fsr";
import {
  queueDuePreparedInstagramPosts,
  queuePreparedBotdInstagramPostsForDate,
} from "../../../features/dashboard/admin/planner/instagramServices";
import { parseDateString, toUtcStartOfDay } from "../../../lib/utils";

/**
 * Queue prepared Instagram posts for one UTC day (default: today).
 *
 *   POST https://www.photobookers.com/jobs/cron/daily-botd-instagram
 *   Authorization: Bearer $CRON_SECRET
 *
 * Optional query:
 *   date=YYYY-MM-DD — backfill a specific day
 *   allPrepared=1   — queue every prepared post from today onward (fills Buffer fast)
 */
export const POST = createRoute(async (c: Context) => {
  const secret = c.req.header("Authorization")?.replace(/^Bearer\s+/i, "");
  const expected = process.env.CRON_SECRET;
  if (!expected || secret !== expected) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const dateParam = c.req.query("date");
  const allPrepared =
    c.req.query("allPrepared") === "1" || c.req.query("allPrepared") === "true";
  let resultPromise;
  if (allPrepared) {
    resultPromise = queueDuePreparedInstagramPosts();
  } else if (dateParam) {
    const targetDate = parseDateString(dateParam);
    if (Number.isNaN(targetDate.getTime())) {
      return c.json({ error: "Invalid date (use YYYY-MM-DD)" }, 400);
    }
    resultPromise = queuePreparedBotdInstagramPostsForDate(targetDate);
  } else {
    resultPromise = queuePreparedBotdInstagramPostsForDate(toUtcStartOfDay(new Date()));
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
