import { Context } from "hono";
import { createRoute } from "hono-fsr";
import { runNotifyFollowersNewPostsCron } from "@/jobs/cronRunners";
import { requireCronSecret } from "@/jobs/cronRouteAuth";

/** Prefer GitHub Actions: npx tsx scripts/cron/run.ts notify-followers-new-posts */
export const POST = createRoute(async (c: Context) => {
  const unauthorized = requireCronSecret(c);
  if (unauthorized) return unauthorized;

  const [error, result] = await runNotifyFollowersNewPostsCron();
  if (error) return c.json({ error: error.reason }, 500);
  return c.json({ ok: true, ...result });
});
