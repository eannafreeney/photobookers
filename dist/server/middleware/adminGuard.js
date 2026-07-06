import { createMiddleware } from "hono/factory";
import { getUser } from "../utils.js";
const requireAdminAccess = createMiddleware(async (c, next) => {
  const user = await getUser(c);
  if (!user || !user.isAdmin) {
    c.redirect("/dashboard");
  }
  await next();
});
export {
  requireAdminAccess
};
