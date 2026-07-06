import { createRoute } from "hono-fsr";
import { getPendingClaimsCount } from "../../../../features/dashboard/admin/claims/services.js";
const GET = createRoute(async (c) => {
  const [error, count] = await getPendingClaimsCount();
  if (error) return c.json({ ok: false, error: error.reason }, 500);
  return c.json({ count });
});
export {
  GET
};
