import { Context } from "hono";

export const getBaseUrl = (c: Context) => {
  const proto = c.req.header("x-forwarded-proto") ?? "http";
  const host = c.req.header("host") ?? "localhost:3000";
  return `${proto}://${host}`;
};
