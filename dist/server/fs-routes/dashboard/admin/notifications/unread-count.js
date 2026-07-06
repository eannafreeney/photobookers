import { createRoute } from "hono-fsr";
import { getUnreadAdminNotificationsCount } from "../../../../features/dashboard/admin/notifications/services.js";
const GET = createRoute(async (c) => {
  const [error, count] = await getUnreadAdminNotificationsCount();
  if (error) return c.json({ count: 0 }, 500);
  return c.json({ count });
});
export {
  GET
};
