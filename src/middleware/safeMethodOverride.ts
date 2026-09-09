import type { Context, Next } from "hono";
import type { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { methodOverride } from "hono/method-override";
import { isMalformedBodyError } from "../lib/isMalformedBodyError";

/** methodOverride parses every multipart POST; junk bodies must not 500. */
export function safeMethodOverride(app: Hono) {
  const mw = methodOverride({ app, form: "_method" });
  return async (c: Context, next: Next) => {
    try {
      return await mw(c, next);
    } catch (err) {
      if (isMalformedBodyError(err)) {
        throw new HTTPException(400, { message: "Malformed form body" });
      }
      throw err;
    }
  };
}
