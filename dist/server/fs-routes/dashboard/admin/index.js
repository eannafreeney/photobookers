import { createRoute } from "hono-fsr";
const GET = createRoute(
  (c) => c.redirect("/dashboard/admin/notifications", 302)
);
export {
  GET
};
