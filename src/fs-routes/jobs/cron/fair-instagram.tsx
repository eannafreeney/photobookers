import { Context } from "hono";
import { createRoute } from "hono-fsr";
import { runFairInstagramCronJob } from "@/jobs/cronRunners";
import { requireCronSecret } from "@/jobs/cronRouteAuth";

/** Prefer GitHub Actions: npx tsx scripts/cron/run.ts fair-instagram */
export const POST = createRoute(async (c: Context) => {
  const unauthorized = requireCronSecret(c);
  if (unauthorized) return unauthorized;

  const dryRun =
    c.req.query("dryRun") === "1" || c.req.query("dryRun") === "true";
  const fairId = c.req.query("fairId") ?? undefined;

  const [error, result] = await runFairInstagramCronJob({
    dryRun,
    fairId,
  });
  if (error) return c.json({ error: error.reason }, 500);
  return c.json({ ok: true, ...result });
});
