import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../notifications/services", () => ({
  createAdminNotification: vi.fn(async () => [null, { id: "1" }]),
}));

vi.mock("../../lib/sendEmail", () => ({
  sendAdminEmail: vi.fn(async () => [null, undefined]),
}));

import { createAdminNotification } from "../notifications/services";
import { sendAdminEmail } from "../../lib/sendEmail";
import {
  notifyAdminServerErrorIfDue,
  recordServerErrorForAdmin,
  resetServerErrorNotifyState,
} from "./notifyAdminServerError";

describe("notifyAdminServerError", () => {
  afterEach(() => {
    resetServerErrorNotifyState();
    vi.clearAllMocks();
  });

  it("batches errors and notifies once per cooldown window", async () => {
    recordServerErrorForAdmin({
      path: "/books/foo",
      method: "GET",
      message: "db down",
    });
    recordServerErrorForAdmin({
      path: "/featured",
      method: "GET",
      message: "timeout",
    });

    await notifyAdminServerErrorIfDue(1_000);

    expect(createAdminNotification).toHaveBeenCalledTimes(1);
    expect(createAdminNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "server_error",
        title: "2 server errors",
        body: expect.stringContaining("Latest: GET /featured"),
      }),
    );
    expect(sendAdminEmail).toHaveBeenCalledTimes(1);

    recordServerErrorForAdmin({
      path: "/creators/bar",
      method: "GET",
      message: "still broken",
    });
    await notifyAdminServerErrorIfDue(1_000 + 5 * 60_000);

    expect(createAdminNotification).toHaveBeenCalledTimes(1);
    expect(sendAdminEmail).toHaveBeenCalledTimes(1);
  });

  it("notifies again after the cooldown window", async () => {
    recordServerErrorForAdmin({
      path: "/books/foo",
      method: "GET",
      message: "db down",
    });
    await notifyAdminServerErrorIfDue(0);

    recordServerErrorForAdmin({
      path: "/creators/bar",
      method: "GET",
      message: "still broken",
    });
    await notifyAdminServerErrorIfDue(16 * 60_000);

    expect(createAdminNotification).toHaveBeenCalledTimes(2);
    expect(sendAdminEmail).toHaveBeenCalledTimes(2);
  });
});
