import { createRoute } from "hono-fsr";
import { getBaseUrl } from "../lib/hyperview.js";
const GET = createRoute(async (c) => {
  const origin = getBaseUrl(c);
  const body = `User-agent: *
Allow: /

Disallow: /dashboard/
Disallow: /auth/
Disallow: /api/
Disallow: /hyperview/
Disallow: /fragments/
Disallow: /jobs/
Disallow: /claims/
Disallow: /feed
Disallow: /library
Disallow: /messages
Disallow: /followed-creators
Disallow: /books/preview/

Sitemap: ${origin}/sitemap.xml
`;
  return c.body(body, 200, {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "public, max-age=86400"
  });
});
export {
  GET
};
