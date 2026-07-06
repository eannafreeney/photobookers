import { createRoute } from "hono-fsr";
import { runVerifiedCreatorInstagramCron } from "../../../domain/planner/cron/verifiedCreatorInstagramServices.js";
const POST = createRoute(async (c) => {
  const secret = c.req.header("Authorization")?.replace(/^Bearer\s+/i, "") ?? c.req.query("secret");
  const expected = process.env.CRON_SECRET;
  if (!expected || secret !== expected) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const dryRun = c.req.query("dryRun") === "1" || c.req.query("dryRun") === "true";
  const creatorId = c.req.query("creatorId") ?? void 0;
  const [error, result] = await runVerifiedCreatorInstagramCron({
    dryRun,
    creatorId
  });
  if (error) {
    return c.json({ error: error.reason }, 500);
  }
  return c.json({ ok: true, ...result });
});
export {
  POST
};
