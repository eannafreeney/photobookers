import { Context } from "hono";
import { createRoute } from "hono-fsr";
import { runPublisherReleaseWatchCronJob } from "@/jobs/cronRunners";
import { requireCronSecret } from "@/jobs/cronRouteAuth";

/**
 * Weekly publisher catalogue watch — email admin when new products appear.
 *
 * Prefer GitHub Actions: npx tsx scripts/cron/run.ts publisher-release-watch
 *
 * Optional query: dryRun=1
 */
export const POST = createRoute(async (c: Context) => {
  const unauthorized = requireCronSecret(c);
  if (unauthorized) return unauthorized;

  const dryRun =
    c.req.query("dryRun") === "1" || c.req.query("dryRun") === "true";

  const [error, result] = await runPublisherReleaseWatchCronJob({ dryRun });
  if (error) return c.json({ error: error.reason }, 500);
  return c.json({ ok: true, ...result });
});
