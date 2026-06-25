import type { Context } from "hono";

/** Required path segment from file-system routes. */
export function routeParam(c: Context, name: string): string {
  const value = c.req.param(name);
  if (value === undefined) {
    throw new Error(`Missing route param: ${name}`);
  }
  return value;
}
