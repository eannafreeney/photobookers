import { describe, expect, it, vi, beforeEach } from "vitest";
import { Hono } from "hono";

const {
  getCookieMock,
  setCookieMock,
  getUserMock,
  recordBookViewMock,
  getSharedCookieOptionsMock,
} = vi.hoisted(() => ({
  getCookieMock: vi.fn(),
  setCookieMock: vi.fn(),
  getUserMock: vi.fn(),
  recordBookViewMock: vi.fn(),
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
  recordBookView: recordBookViewMock,
}));

vi.mock("../../lib/authCookies", () => ({
  getSharedCookieOptions: getSharedCookieOptionsMock,
}));

vi.mock("../../db/client", () => ({
  db: {},
}));

import { bookViewCookieName, maybeRecordBookView } from "./record";

describe("maybeRecordBookView", () => {
  const book = { id: "book-1", slug: "my-book" };

  beforeEach(() => {
    getCookieMock.mockReset();
    setCookieMock.mockReset();
    getUserMock.mockReset();
    recordBookViewMock.mockReset();
    getSharedCookieOptionsMock.mockReset();

    getUserMock.mockResolvedValue(null);
    recordBookViewMock.mockResolvedValue({ ok: true });
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
      await maybeRecordBookView(c, book, "web");
      return c.text("ok");
    });
    await app.request("/");
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(recordBookViewMock).toHaveBeenCalledWith({
      bookId: book.id,
      userId: null,
      source: "web",
      referer: undefined,
    });
    expect(setCookieMock).toHaveBeenCalledWith(
      expect.anything(),
      bookViewCookieName(book.slug),
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
      await maybeRecordBookView(c, book, "web");
      return c.text("ok");
    });
    await app.request("/");

    expect(recordBookViewMock).not.toHaveBeenCalled();
    expect(setCookieMock).not.toHaveBeenCalled();
  });
});
