import { Context } from "hono";
import { createRoute } from "hono-fsr";
import { runCreatorMilestoneEmailsCronJob } from "@/jobs/cronRunners";
import { parseDateString } from "../../../lib/utils";
import { requireCronSecret } from "@/jobs/cronRouteAuth";

/** Prefer GitHub Actions: npx tsx scripts/cron/run.ts creator-milestone-emails */
export const POST = createRoute(async (c: Context) => {
  const unauthorized = requireCronSecret(c);
  if (unauthorized) return unauthorized;

  const dryRun =
    c.req.query("dryRun") === "1" || c.req.query("dryRun") === "true";
  const to = c.req.query("to") ?? undefined;
  const creatorId = c.req.query("creatorId") ?? undefined;
  const dateParam = c.req.query("date");
  let date: Date | undefined;
  if (dateParam) {
    date = parseDateString(dateParam);
    if (Number.isNaN(date.getTime())) {
      return c.json({ error: "Invalid date (use YYYY-MM-DD)" }, 400);
    }
  }

  const [error, result] = await runCreatorMilestoneEmailsCronJob({
    dryRun,
    to,
    creatorId,
    date,
  });
  if (error) return c.json({ error: error.reason }, 500);
  return c.json({ ok: true, ...result });
});
