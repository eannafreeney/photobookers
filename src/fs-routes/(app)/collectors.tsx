import { createRoute } from "hono-fsr";
import { Context } from "hono";

export const GET = createRoute(async (c: Context) => {
  return c.redirect("/creators?type=collector", 301);
});
