import { createRoute } from "hono-fsr";
const GET = createRoute(
  (c) => c.json({ error: "Activity stream is disabled" }, 410)
);
export {
  GET
};
