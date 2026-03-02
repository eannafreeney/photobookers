import { createMiddleware } from "hono/factory";
import { getUser } from "../utils";

export const requireAdminAccess = createMiddleware(async (c, next) => {
  const user = await getUser(c);
  if (!user || !user.isAdmin) {
    c.redirect("/dashboard/books");
  }
  await next();
});
