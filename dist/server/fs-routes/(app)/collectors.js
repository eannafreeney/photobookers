import { createRoute } from "hono-fsr";
const GET = createRoute(async (c) => {
  return c.redirect("/creators?type=collector", 301);
});
export {
  GET
};
