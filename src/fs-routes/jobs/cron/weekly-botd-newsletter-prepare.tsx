import { Context } from "hono";
import { createRoute } from "hono-fsr";
import { runWeeklyBotdNewsletterPrepareCron } from "@/jobs/cronRunners";
import { requireCronSecret } from "@/jobs/cronRouteAuth";

/**
 * Pre-create the next Thu–Wed newsletter draft. Scheduled every Tuesday.
 *
 * Prefer GitHub Actions: npx tsx scripts/cron/run.ts weekly-botd-newsletter-prepare
 *
 * Optional query: dryRun=1, force=1
 */
export const POST = createRoute(async (c: Context) => {
  const unauthorized = requireCronSecret(c);
  if (unauthorized) return unauthorized;

  const dryRun =
    c.req.query("dryRun") === "1" || c.req.query("dryRun") === "true";
  const force = c.req.query("force") === "1" || c.req.query("force") === "true";

  const [error, result] = await runWeeklyBotdNewsletterPrepareCron({
    dryRun,
    force,
  });
  if (error) return c.json({ error: error.reason }, 500);
  return c.json({ ok: true, ...result });
});
