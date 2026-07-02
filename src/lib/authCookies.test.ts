import { describe, expect, it } from "vitest";
import { Hono } from "hono";
import { getSharedCookieOptions } from "./authCookies";

describe("getSharedCookieOptions", () => {
  it("uses localhost-friendly options when request host is local", async () => {
    const app = new Hono();
    app.get("/test", (c) => {
      const opts = getSharedCookieOptions(c);
      return c.json(opts);
    });

    const res = await app.request("http://localhost:5173/test");
    expect(await res.json()).toEqual({ path: "/" });
  });

  it("uses production domain when request host is production", async () => {
    const app = new Hono();
    app.get("/test", (c) => {
      const opts = getSharedCookieOptions(c);
      return c.json(opts);
    });

    const res = await app.request("https://www.photobookers.com/test", {
      headers: { host: "www.photobookers.com" },
    });
    expect(await res.json()).toEqual({
      path: "/",
      domain: ".photobookers.com",
      secure: true,
    });
  });

  it("uses host-only cookies on staging subdomain", async () => {
    const app = new Hono();
    app.get("/test", (c) => {
      const opts = getSharedCookieOptions(c);
      return c.json(opts);
    });

    const res = await app.request("https://staging.photobookers.com/test", {
      headers: { host: "staging.photobookers.com" },
    });
    expect(await res.json()).toEqual({
      path: "/",
      secure: true,
    });
  });

  it("falls back to SITE_URL when no request context is provided", () => {
    const prev = process.env.SITE_URL;
    process.env.SITE_URL = "https://www.photobookers.com";
    try {
      expect(getSharedCookieOptions()).toEqual({
        path: "/",
        domain: ".photobookers.com",
        secure: true,
      });
    } finally {
      process.env.SITE_URL = prev;
    }
  });
});
