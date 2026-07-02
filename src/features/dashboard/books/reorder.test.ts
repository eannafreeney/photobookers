import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  selectMock,
  findManyMock,
  transactionMock,
  invalidateCreatorCacheMock,
} = vi.hoisted(() => ({
  selectMock: vi.fn(),
  findManyMock: vi.fn(),
  transactionMock: vi.fn(),
  invalidateCreatorCacheMock: vi.fn(),
}));

vi.mock("../../../db/client", () => ({
  db: {
    select: selectMock,
    query: {
      books: {
        findMany: findManyMock,
      },
    },
    transaction: transactionMock,
  },
}));

vi.mock("../../app/services", () => ({
  invalidateBookCache: vi.fn(),
  invalidateCreatorCache: invalidateCreatorCacheMock,
}));

import { reorderBooksForCreator } from "./services";

const creator = {
  id: "creator-1",
  type: "artist" as const,
  slug: "jane-doe",
};

function mockTotalCount(count: number) {
  selectMock.mockReturnValue({
    from: vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue([{ value: count }]),
    }),
  });
}

describe("reorderBooksForCreator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects empty ordered IDs", async () => {
    const [error] = await reorderBooksForCreator(creator, []);
    expect(error?.reason).toBe("No books to reorder");
  });

  it("rejects duplicate book IDs", async () => {
    const [error] = await reorderBooksForCreator(creator, [
      "book-1",
      "book-1",
    ]);
    expect(error?.reason).toBe("Duplicate book IDs");
  });

  it("rejects partial ID lists", async () => {
    mockTotalCount(3);
    const [error] = await reorderBooksForCreator(creator, ["book-1", "book-2"]);
    expect(error?.reason).toBe("Must include all books");
  });

  it("rejects IDs that do not belong to the creator", async () => {
    mockTotalCount(2);
    findManyMock.mockResolvedValue([{ id: "book-1" }]);

    const [error] = await reorderBooksForCreator(creator, ["book-1", "book-2"]);
    expect(error?.reason).toBe(
      "One or more books do not belong to this creator",
    );
  });

  it("writes sequential sortOrder values and invalidates creator cache", async () => {
    mockTotalCount(2);
    findManyMock.mockResolvedValue([{ id: "book-1" }, { id: "book-2" }]);

    const setMock = vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    });
    const updateMock = vi.fn().mockReturnValue({ set: setMock });

    transactionMock.mockImplementation(async (fn) => {
      await fn({ update: updateMock });
    });

    const [error, result] = await reorderBooksForCreator(creator, [
      "book-1",
      "book-2",
    ]);

    expect(error).toBeNull();
    expect(result).toBeUndefined();
    expect(updateMock).toHaveBeenCalledTimes(2);
    expect(setMock).toHaveBeenNthCalledWith(1, { sortOrder: 0 });
    expect(setMock).toHaveBeenNthCalledWith(2, { sortOrder: 1 });
    expect(invalidateCreatorCacheMock).toHaveBeenCalledWith("jane-doe");
  });
});
