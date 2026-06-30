import { describe, expect, it, vi, beforeEach } from "vitest";
import { Hono } from "hono";

const {
  getCookieMock,
  setCookieMock,
  getUserMock,
  recordCreatorViewMock,
  getSharedCookieOptionsMock,
} = vi.hoisted(() => ({
  getCookieMock: vi.fn(),
  setCookieMock: vi.fn(),
  getUserMock: vi.fn(),
  recordCreatorViewMock: vi.fn(),
  getSharedCookieOptionsMock: vi.fn(),
}));

vi.mock("hono/cookie", () => ({
  getCookie: getCookieMock,
  setCookie: setCookieMock,
}));

vi.mock("../../utils", () => ({
  getUser: getUserMock,
}));

vi.mock("./services", () => ({
  recordCreatorView: recordCreatorViewMock,
}));

vi.mock("../../lib/authCookies", () => ({
  getSharedCookieOptions: getSharedCookieOptionsMock,
}));

import { creatorViewCookieName, maybeRecordCreatorView } from "./record";

describe("maybeRecordCreatorView", () => {
  const creator = { id: "creator-1", slug: "jane-doe" };

  beforeEach(() => {
    getCookieMock.mockReset();
    setCookieMock.mockReset();
    getUserMock.mockReset();
    recordCreatorViewMock.mockReset();
    getSharedCookieOptionsMock.mockReset();

    getUserMock.mockResolvedValue(null);
    recordCreatorViewMock.mockResolvedValue({ ok: true });
    getSharedCookieOptionsMock.mockReturnValue({
      path: "/",
      secure: false,
      domain: undefined,
    });
  });

  it("records a view and sets a session cookie on first visit", async () => {
    getCookieMock.mockReturnValue(undefined);

    const app = new Hono();
    app.get("/", async (c) => {
      await maybeRecordCreatorView(c, creator, "web");
      return c.text("ok");
    });
    await app.request("/");
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(recordCreatorViewMock).toHaveBeenCalledWith({
      creatorId: creator.id,
      userId: null,
      source: "web",
      referer: undefined,
    });
    expect(setCookieMock).toHaveBeenCalledWith(
      expect.anything(),
      creatorViewCookieName(creator.slug),
      "1",
      expect.objectContaining({
        path: "/",
        httpOnly: true,
        sameSite: "Lax",
      }),
    );
  });

  it("skips recording when the session cookie is already set", async () => {
    getCookieMock.mockReturnValue("1");

    const app = new Hono();
    app.get("/", async (c) => {
      await maybeRecordCreatorView(c, creator, "web");
      return c.text("ok");
    });
    await app.request("/");

    expect(recordCreatorViewMock).not.toHaveBeenCalled();
    expect(setCookieMock).not.toHaveBeenCalled();
  });
});
