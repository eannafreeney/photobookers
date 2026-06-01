import { Context } from "hono";
import { createRoute } from "hono-fsr";
import { queueDuePreparedBotdInstagramPosts } from "../../../features/dashboard/admin/planner/instagramServices";

export const POST = createRoute(async (c: Context) => {
  const secret =
    c.req.header("Authorization")?.replace(/^Bearer\s+/i, "") ??
    c.req.query("secret");
  const expected = process.env.CRON_SECRET;
  if (!expected || secret !== expected) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const [error, result] = await queueDuePreparedBotdInstagramPosts();
  if (error) {
    return c.json({ error: error.reason }, 500);
  }

  return c.json({
    ok: true,
    queued: result.queued,
    skipped: result.skipped,
  });
});
