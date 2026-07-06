import { createRoute } from "hono-fsr";
import { getBaseUrl } from "../../lib/hyperview.js";
const GET = createRoute(async (c) => {
  const baseUrl = getBaseUrl(c);
  return c.body(
    `<?xml version="1.0" encoding="UTF-8"?>
        <doc xmlns="https://hyperview.org/hyperview">
            <navigator id="root" type="stack">
            <nav-route id="books" href="${baseUrl}/hyperview/featured" />
            </navigator>
        </doc>`,
    200,
    { "Content-Type": "application/vnd.hyperview+xml; charset=utf-8" }
  );
});
export {
  GET
};
