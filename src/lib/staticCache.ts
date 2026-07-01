import {
  serveStatic,
  type ServeStaticOptions,
} from "@hono/node-server/serve-static";

export const BUNDLE_CACHE =
  "public, max-age=86400, stale-while-revalidate=604800";
export const IMMUTABLE_CACHE = "public, max-age=31536000, immutable";

export function cachedStatic<
  E extends Record<string, unknown> = Record<string, unknown>,
>(options: ServeStaticOptions<E> & { cacheControl: string }) {
  const { cacheControl, ...serveOptions } = options;
  return serveStatic<E>({
    ...serveOptions,
    onFound: (_path, c) => {
      c.header("Cache-Control", cacheControl);
    },
  });
}
