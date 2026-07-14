import { createRoute } from "hono-fsr";
import { Context } from "hono";

export const GET = createRoute(async (c: Context) => {
  const url = new URL(c.req.url);
  url.pathname = "/shelf";
  return c.redirect(url.toString(), 301);
});
