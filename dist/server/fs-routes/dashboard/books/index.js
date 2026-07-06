import { createRoute } from "hono-fsr";
const GET = createRoute(async (c) => {
  const url = new URL(c.req.url);
  return c.redirect(`/dashboard${url.search}`);
});
export {
  GET
};
