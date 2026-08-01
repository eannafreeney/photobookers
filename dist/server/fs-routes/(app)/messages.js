import { createRoute } from "hono-fsr";
const GET = createRoute((c) => c.redirect("/feed", 302));
export {
  GET
};
