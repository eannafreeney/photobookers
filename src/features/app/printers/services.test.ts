import { beforeEach, describe, expect, it, vi } from "vitest";

const { selectMock, insertMock, updateMock, sendEmailMock } = vi.hoisted(() => ({
  selectMock: vi.fn(),
  insertMock: vi.fn(),
  updateMock: vi.fn(),
  sendEmailMock: vi.fn(),
}));

vi.mock("../../../db/client", () => ({
  db: {
    select: selectMock,
    insert: insertMock,
    update: updateMock,
  },
}));

vi.mock("../../../lib/sendEmail", () => ({
  sendEmail: sendEmailMock,
}));

import {
  colophonCredit,
  isPublicPrintedBook,
  planQuotePrinters,
  unpublishedPrinterIds,
} from "./rules";
import { sendMockQuoteRequest, submitQuoteRequest } from "./services";

const user = {
  id: "user-1",
  email: "ada@example.com",
  firstName: "Ada",
  lastName: "Lovelace",
};

const brief = {
  projectName: "Spring monograph",
  details: "500 copies, 80 pages, hardcover, March",
  shipToCountry: "France",
  note: null,
};

function mockSelect(rows: unknown[]) {
  const chain = {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockResolvedValue(rows),
  };
  selectMock.mockReturnValue(chain);
  return chain;
}

describe("planQuotePrinters", () => {
  it("rejects more than three printers", () => {
    const [error] = planQuotePrinters(["a", "b", "c", "d"]);
    expect(error?.reason).toBe("Choose 1 to 3 printers");
  });

  it("keeps a unique set of one to three", () => {
    const [error, ids] = planQuotePrinters(["a", "a", "b"]);
    expect(error).toBeNull();
    expect(ids).toEqual(["a", "b"]);
  });
});

describe("unpublishedPrinterIds", () => {
  it("lists ids that are not published", () => {
    expect(unpublishedPrinterIds(["a", "b"], ["a"])).toEqual(["b"]);
  });
});

describe("isPublicPrintedBook", () => {
  const now = new Date("2026-01-01");
  const book = {
    publicationStatus: "published",
    approvalStatus: "approved",
    releaseDate: null as Date | null,
  };

  it("shows a published approved book", () => {
    expect(isPublicPrintedBook(book, now)).toBe(true);
  });

  it("hides drafts, unapproved books, and future releases", () => {
    expect(
      isPublicPrintedBook({ ...book, publicationStatus: "draft" }, now),
    ).toBe(false);
    expect(
      isPublicPrintedBook({ ...book, approvalStatus: "pending" }, now),
    ).toBe(false);
    expect(
      isPublicPrintedBook(
        { ...book, releaseDate: new Date("2026-06-01") },
        now,
      ),
    ).toBe(false);
  });
});

describe("submitQuoteRequest", () => {
  beforeEach(() => {
    selectMock.mockReset();
    insertMock.mockReset();
    updateMock.mockReset();
    sendEmailMock.mockReset();
    sendEmailMock.mockResolvedValue([null, undefined]);
  });

  it("does not write rows when more than three printers are chosen", async () => {
    const [error] = await submitQuoteRequest(
      { ...brief, printerIds: ["a", "b", "c", "d"] },
      user,
    );
    expect(error?.reason).toBe("Choose 1 to 3 printers");
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("writes one recipient row per published printer", async () => {
    mockSelect([
      { id: "p1", name: "Alpha", email: "a@print.test" },
      { id: "p2", name: "Beta", email: "b@print.test" },
    ]);

    const requestInsert = {
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([{ id: "req-1" }]),
    };
    const recipientInsert = {
      values: vi.fn().mockResolvedValue(undefined),
    };
    insertMock
      .mockReturnValueOnce(requestInsert)
      .mockReturnValueOnce(recipientInsert);
    updateMock.mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      }),
    });

    const [error, result] = await submitQuoteRequest(
      { ...brief, printerIds: ["p1", "p2"] },
      user,
    );

    expect(error).toBeNull();
    expect(result?.printerNames).toEqual(["Alpha", "Beta"]);
    expect(recipientInsert.values).toHaveBeenCalledWith([
      { requestId: "req-1", printerId: "p1" },
      { requestId: "req-1", printerId: "p2" },
    ]);
  });
});

describe("colophonCredit", () => {
  it("links published printers and still credits drafts by name", () => {
    expect(
      colophonCredit({ name: "Steidl", slug: "steidl", status: "published" }),
    ).toEqual({ name: "Steidl", slug: "steidl" });
    expect(
      colophonCredit({ name: "Local Press", slug: "local-press", status: "draft" }),
    ).toEqual({ name: "Local Press", slug: null });
  });
});

describe("sendMockQuoteRequest", () => {
  beforeEach(() => {
    selectMock.mockReset();
    insertMock.mockReset();
    sendEmailMock.mockReset();
    sendEmailMock.mockResolvedValue([null, undefined]);
  });

  it("emails the admin the quote the printer would get, and saves nothing", async () => {
    mockSelect([{ id: "p1", name: "Alpha", email: "a@print.test" }]);

    const [error] = await sendMockQuoteRequest(
      { ...brief, printerIds: ["p1"] },
      user,
    );

    expect(error).toBeNull();
    expect(insertMock).not.toHaveBeenCalled();
    expect(sendEmailMock).toHaveBeenCalledWith(
      "ada@example.com",
      "[Test] Print quote request from Ada Lovelace",
      expect.stringContaining("a@print.test"),
    );
  });
});
