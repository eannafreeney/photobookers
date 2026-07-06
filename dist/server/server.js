import { serve } from "@hono/node-server";
import app from "./index.js";
const port = Number(process.env.PORT) || 3e3;
console.log(`Server running on http://localhost:${port}`);
serve({
  fetch: app.fetch,
  port
});
