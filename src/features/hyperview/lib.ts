import { Context } from "hono";

export const getIsHyperview = (c: Context) =>
  c.req.path.startsWith("/hyperview") ||
  (c.req.header("accept") ?? "").includes("application/vnd.hyperview");
