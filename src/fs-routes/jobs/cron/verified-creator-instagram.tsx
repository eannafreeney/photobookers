import { Context } from "hono";
import { createRoute } from "hono-fsr";
import { runVerifiedCreatorInstagramCron } from "../../../domain/planner/cron/verifiedCreatorInstagramServices";

/**
 * Queue Instagram posts for newly verified creators via Buffer.
 *
 * Picks up verified creators not yet queued (`verifiedInstagramQueuedAt` is null)
 * who have at least one published book and a usable image.
 *
 * Schedule externally, e.g. cron-job.org:
 *
 *   POST https://www.photobookers.com/jobs/cron/verified-creator-instagram
 *   Authorization: Bearer $CRON_SECRET
 *   Cron: 0 11 * * *  (daily 11:00 UTC)
 *
 * Optional query params:
 *   dryRun=1       — evaluate only, do not queue in Buffer
 *   creatorId=uuid — limit to one creator (testing)
 */
export const POST = createRoute(async (c: Context) => {
  const secret =
    c.req.header("Authorization")?.replace(/^Bearer\s+/i, "") ??
    c.req.query("secret");
  const expected = process.env.CRON_SECRET;
  if (!expected || secret !== expected) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const dryRun =
    c.req.query("dryRun") === "1" || c.req.query("dryRun") === "true";
  const creatorId = c.req.query("creatorId") ?? undefined;

  const [error, result] = await runVerifiedCreatorInstagramCron({
    dryRun,
    creatorId,
  });
  if (error) {
    return c.json({ error: error.reason }, 500);
  }

  return c.json({ ok: true, ...result });
});
