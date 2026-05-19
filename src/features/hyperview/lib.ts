import { Context } from "hono";

export const getIsHyperview = (c: Context) =>
  (c.req.header("accept") ?? "").includes("application/vnd.hyperview");
