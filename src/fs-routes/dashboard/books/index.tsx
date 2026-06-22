import { createRoute } from "hono-fsr";
import { Context } from "hono";

export const GET = createRoute(async (c: Context) => {
  const url = new URL(c.req.url);
  return c.redirect(`/dashboard${url.search}`);
});
