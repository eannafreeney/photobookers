import { createRoute } from "hono-fsr";

/** Legacy homepage URL — permanent redirect to `/`, preserving query string. */
export const GET = createRoute(async (c) => {
  const url = new URL(c.req.url);
  const target = url.search ? `/${url.search}` : "/";
  return c.redirect(target, 301);
});
