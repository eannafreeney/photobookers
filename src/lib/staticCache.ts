import type { Context } from "hono";
import {
  serveStatic,
  type ServeStaticOptions,
} from "@hono/node-server/serve-static";

export const BUNDLE_CACHE =
  "public, max-age=86400, stale-while-revalidate=604800";
export const IMMUTABLE_CACHE = "public, max-age=31536000, immutable";

/** Anonymous HTML: short private cache. Signed-in: never store. */
const ANON_PAGE_CACHE = "private, max-age=120, stale-while-revalidate=600";

export function setAnonPageCache(c: Context, user: unknown) {
  if (!user) {
    c.header("Vary", "Cookie");
    c.header("Cache-Control", ANON_PAGE_CACHE);
  } else {
    c.header("Cache-Control", "private, no-store");
  }
}

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
