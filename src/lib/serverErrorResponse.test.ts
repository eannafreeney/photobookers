import { Hono } from "hono";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../domain/server-errors/notifyAdminServerError", () => ({
  recordAndNotifyAdminServerError: vi.fn(async () => {}),
}));

vi.mock("../utils", () => ({
  getUser: vi.fn(async () => null),
}));

import { recordAndNotifyAdminServerError } from "../domain/server-errors/notifyAdminServerError";
import { handleServerError } from "./serverErrorResponse";

describe("handleServerError", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 and does not page for malformed FormData", async () => {
    const app = new Hono();
    app.onError((err, c) => handleServerError(c, err));
    app.post("/", () => {
      throw new TypeError("Failed to parse body as FormData.");
    });

    const res = await app.request("/", { method: "POST" });

    expect(res.status).toBe(400);
    expect(recordAndNotifyAdminServerError).not.toHaveBeenCalled();
  });
});
