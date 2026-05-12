import { createRoute } from "hono-fsr";

export const GET = createRoute(async (c) => {
  const proto = c.req.header("x-forwarded-proto") ?? "http";
  const host = c.req.header("host") ?? "localhost:5173";
  const baseUrl = `${proto}://${host}`;

  return c.body(
    `<?xml version="1.0" encoding="UTF-8"?>
        <doc xmlns="https://hyperview.org/hyperview">
            <navigator id="root" type="stack">
            <nav-route id="books" href="${baseUrl}/hyperview/featured" />
            </navigator>
        </doc>`,
    200,
    { "Content-Type": "application/vnd.hyperview+xml; charset=utf-8" },
  );
});
