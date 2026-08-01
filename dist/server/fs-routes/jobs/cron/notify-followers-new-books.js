import { createRoute } from "hono-fsr";
import { runNotifyFollowersNewBooksCron } from "../../../jobs/cronRunners.js";
import { requireCronSecret } from "../../../jobs/cronRouteAuth.js";
const POST = createRoute(async (c) => {
  const unauthorized = requireCronSecret(c);
  if (unauthorized) return unauthorized;
  const [error, result] = await runNotifyFollowersNewBooksCron();
  if (error) return c.json({ error: error.reason }, 500);
  return c.json({ ok: true, ...result });
});
export {
  POST
};
