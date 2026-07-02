import { createRoute } from "hono-fsr";

export const GET = createRoute((c) =>
  c.json({ error: "Activity stream is disabled" }, 410),
);
