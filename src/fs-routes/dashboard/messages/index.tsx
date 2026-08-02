import { createRoute } from "hono-fsr";
import { Context } from "hono";
import { getUser } from "../../../utils";

/** Creator posts UI moved to the unified /dashboard/posts route. */
export const GET = createRoute(async (c: Context) => {
  await getUser(c);
  return c.redirect("/dashboard/posts");
});
