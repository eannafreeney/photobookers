import { createRoute } from "hono-fsr";
import { getUser } from "../../../utils.js";
const GET = createRoute(async (c) => {
  await getUser(c);
  return c.redirect("/dashboard/posts");
});
export {
  GET
};
