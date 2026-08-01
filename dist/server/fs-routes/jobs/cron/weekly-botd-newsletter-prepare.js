import { createRoute } from "hono-fsr";
import { runWeeklyBotdNewsletterPrepareCron } from "../../../jobs/cronRunners.js";
import { requireCronSecret } from "../../../jobs/cronRouteAuth.js";
const POST = createRoute(async (c) => {
  const unauthorized = requireCronSecret(c);
  if (unauthorized) return unauthorized;
  const dryRun = c.req.query("dryRun") === "1" || c.req.query("dryRun") === "true";
  const force = c.req.query("force") === "1" || c.req.query("force") === "true";
  const [error, result] = await runWeeklyBotdNewsletterPrepareCron({
    dryRun,
    force
  });
  if (error) return c.json({ error: error.reason }, 500);
  return c.json({ ok: true, ...result });
});
export {
  POST
};
