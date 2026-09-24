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

import { planQuotePrinters, unpublishedPrinterIds } from "./rules";
import { submitQuoteRequest } from "./services";

const user = {
  id: "user-1",
  email: "ada@example.com",
  firstName: "Ada",
  lastName: "Lovelace",
};

const brief = {
  copies: 500,
  pageCount: 80,
  trimSize: "20 × 25 cm",
  binding: "hardcover",
  deadline: "March",
  shipToCountry: "France",
  referenceBooks: "A book I love",
  message: null,
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
