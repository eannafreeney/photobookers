import { createRoute } from "hono-fsr";
import { runVerifiedCreatorInstagramCronJob } from "../../../jobs/cronRunners.js";
import { requireCronSecret } from "../../../jobs/cronRouteAuth.js";
const POST = createRoute(async (c) => {
  const unauthorized = requireCronSecret(c);
  if (unauthorized) return unauthorized;
  const dryRun = c.req.query("dryRun") === "1" || c.req.query("dryRun") === "true";
  const creatorId = c.req.query("creatorId") ?? void 0;
  const [error, result] = await runVerifiedCreatorInstagramCronJob({
    dryRun,
    creatorId
  });
  if (error) return c.json({ error: error.reason }, 500);
  return c.json({ ok: true, ...result });
});
export {
  POST
};
