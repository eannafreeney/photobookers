import { createRoute } from "hono-fsr";
const GET = createRoute(async (c) => {
  return c.redirect("/featured");
});
export {
  GET
};
