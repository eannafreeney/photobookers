import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { describe, expect, it } from "vitest";
import { safeMethodOverride } from "./safeMethodOverride";

const appWithOverride = () => {
  const app = new Hono();
  app.use("*", safeMethodOverride(app));
  app.onError((err, c) => {
    if (err instanceof HTTPException) return err.getResponse();
    throw err;
  });
  app.post("/", (c) => c.text("posted"));
  app.delete("/items", (c) => c.text("deleted"));
  return app;
};

describe("safeMethodOverride", () => {
  it("turns undici multipart parse failures into 400", async () => {
    const app = appWithOverride();
    const res = await app.request("/", {
      method: "POST",
      headers: { "content-type": "multipart/form-data" },
      body: "not actually multipart",
    });
    expect(res.status).toBe(400);
  });

  it("still honors _method overrides", async () => {
    const app = appWithOverride();
    const res = await app.request("/items", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ _method: "DELETE" }),
    });
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("deleted");
  });
});
