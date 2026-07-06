import { Context } from "hono";
import { createRoute } from "hono-fsr";
import { runNotifyFollowersNewBooksCron } from "@/jobs/cronRunners";
import { requireCronSecret } from "@/jobs/cronRouteAuth";

/** Prefer GitHub Actions: npx tsx scripts/cron/run.ts notify-followers-new-books */
export const POST = createRoute(async (c: Context) => {
  const unauthorized = requireCronSecret(c);
  if (unauthorized) return unauthorized;

  const [error, result] = await runNotifyFollowersNewBooksCron();
  if (error) return c.json({ error: error.reason }, 500);
  return c.json({ ok: true, ...result });
});
