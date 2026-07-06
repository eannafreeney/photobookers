import { getUser } from "../utils.js";
const requireAdmin = async (c, next) => {
  const user = await getUser(c);
  if (!user?.isAdmin) {
    return c.redirect("/dashboard");
  }
  await next();
};
export {
  requireAdmin
};
