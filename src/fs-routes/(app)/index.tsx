import { createRoute } from "hono-fsr";

export const GET = createRoute(async (c) => {
  return c.redirect("/featured");
});
