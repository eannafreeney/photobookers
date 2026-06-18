import { describe, expect, it, vi, beforeEach } from "vitest";
import { Hono } from "hono";

const { getBookBySlugMock, recordPurchaseClickMock, getUserMock } = vi.hoisted(
  () => ({
    getBookBySlugMock: vi.fn(),
    recordPurchaseClickMock: vi.fn(),
    getUserMock: vi.fn(),
  }),
);

vi.mock("../app/services", () => ({
  getBookBySlug: getBookBySlugMock,
}));

vi.mock("./services", () => ({
  recordPurchaseClick: recordPurchaseClickMock,
}));

vi.mock("../../utils", () => ({
  getUser: getUserMock,
}));

import { handleOutboundPurchaseRedirect } from "./redirect";

describe("handleOutboundPurchaseRedirect", () => {
  const app = new Hono();
  app.get("/out/:slug", handleOutboundPurchaseRedirect);

  beforeEach(() => {
    getBookBySlugMock.mockReset();
    recordPurchaseClickMock.mockReset();
    getUserMock.mockReset();
    recordPurchaseClickMock.mockResolvedValue({ ok: true });
    getUserMock.mockResolvedValue(null);
  });

  it("redirects to purchase link with UTMs and records click", async () => {
    getBookBySlugMock.mockResolvedValue([
      null,
      {
        book: {
          id: "book-1",
          slug: "winter-light",
          approvalStatus: "approved",
          purchaseLink: "https://shop.example.com/book",
        },
      },
    ]);

    const response = await app.request(
      "/out/winter-light?source=hyperview",
      {
        headers: { referer: "https://photobookers.com/books/winter-light" },
      },
    );

    expect(response.status).toBe(302);
    const location = response.headers.get("location");
    expect(location).toContain("https://shop.example.com/book");
    expect(location).toContain("utm_source=photobookers");
    expect(location).toContain("utm_campaign=book-winter-light");
    expect(recordPurchaseClickMock).toHaveBeenCalledWith({
      bookId: "book-1",
      userId: null,
      source: "hyperview",
      referer: "https://photobookers.com/books/winter-light",
    });
  });

  it("returns 404 for missing books", async () => {
    getBookBySlugMock.mockResolvedValue([{ reason: "Book not found" }, null]);

    const response = await app.request("/out/missing-book");
    expect(response.status).toBe(404);
    expect(recordPurchaseClickMock).not.toHaveBeenCalled();
  });

  it("returns 404 for unapproved books", async () => {
    getBookBySlugMock.mockResolvedValue([
      null,
      {
        book: {
          id: "book-1",
          slug: "draft-book",
          approvalStatus: "pending",
          purchaseLink: "https://shop.example.com/book",
        },
      },
    ]);

    const response = await app.request("/out/draft-book");
    expect(response.status).toBe(404);
  });

  it("returns 404 for invalid purchase links", async () => {
    getBookBySlugMock.mockResolvedValue([
      null,
      {
        book: {
          id: "book-1",
          slug: "winter-light",
          approvalStatus: "approved",
          purchaseLink: "not-a-url",
        },
      },
    ]);

    const response = await app.request("/out/winter-light");
    expect(response.status).toBe(404);
  });

  it("defaults invalid source to web", async () => {
    getBookBySlugMock.mockResolvedValue([
      null,
      {
        book: {
          id: "book-1",
          slug: "winter-light",
          approvalStatus: "approved",
          purchaseLink: "https://shop.example.com/book",
        },
      },
    ]);

    await app.request("/out/winter-light?source=newsletter");

    expect(recordPurchaseClickMock).toHaveBeenCalledWith(
      expect.objectContaining({ source: "web" }),
    );
  });
});
