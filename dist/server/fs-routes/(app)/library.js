import { createRoute } from "hono-fsr";
const GET = createRoute(async (c) => {
  const url = new URL(c.req.url);
  url.pathname = "/shelf";
  return c.redirect(url.toString(), 301);
});
export {
  GET
};
