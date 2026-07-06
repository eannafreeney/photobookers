import {
  serveStatic
} from "@hono/node-server/serve-static";
const BUNDLE_CACHE = "public, max-age=86400, stale-while-revalidate=604800";
const IMMUTABLE_CACHE = "public, max-age=31536000, immutable";
function cachedStatic(options) {
  const { cacheControl, ...serveOptions } = options;
  return serveStatic({
    ...serveOptions,
    onFound: (_path, c) => {
      c.header("Cache-Control", cacheControl);
    }
  });
}
export {
  BUNDLE_CACHE,
  IMMUTABLE_CACHE,
  cachedStatic
};
