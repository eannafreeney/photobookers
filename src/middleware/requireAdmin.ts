import { Context, Next } from "hono";
import { getUser } from "../utils";

export const requireAdmin = async (c: Context, next: Next) => {
  const user = await getUser(c);
  if (!user?.isAdmin) {
    return c.redirect("/dashboard/books");
  }
  await next();
};
