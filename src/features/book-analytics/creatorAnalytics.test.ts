import { describe, expect, it, vi, beforeEach } from "vitest";

const { selectMock } = vi.hoisted(() => ({
  selectMock: vi.fn(),
}));

vi.mock("../../db/client", () => ({
  db: {
    select: selectMock,
    query: {
      books: {
        findMany: vi.fn(),
      },
    },
  },
}));

import { books } from "../../db/schema";
import { getTopBooksByViews } from "../book-views/services";
import {
  creatorRoleBookColumn,
  getCreatorBookViewTotals,
  getCreatorFunnelTotals,
} from "./creatorAnalytics";

function mockSelectChain(result: unknown) {
  const chain = {
    from: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    where: vi.fn().mockResolvedValue(result),
    groupBy: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockResolvedValue([]),
  };
  return chain;
}

describe("creatorRoleBookColumn", () => {
  it("uses publisherId for publishers", () => {
    expect(creatorRoleBookColumn("publisher")).toBe(books.publisherId);
  });

  it("uses artistId for artists", () => {
    expect(creatorRoleBookColumn("artist")).toBe(books.artistId);
  });
});

describe("getCreatorBookViewTotals", () => {
  beforeEach(() => {
    selectMock.mockReset();
  });

  it("returns total views and distinct books with views", async () => {
    selectMock
      .mockImplementationOnce(() => mockSelectChain([{ value: 120 }]))
      .mockImplementationOnce(() => mockSelectChain([{ value: 4 }]));

    const result = await getCreatorBookViewTotals({
      creatorId: "creator-1",
      creatorType: "publisher",
    });

    expect(result).toEqual({
      totalViews: 120,
      booksWithViews: 4,
    });
    expect(selectMock).toHaveBeenCalledTimes(2);
  });

  it("defaults missing counts to zero", async () => {
    selectMock
      .mockImplementationOnce(() => mockSelectChain([]))
      .mockImplementationOnce(() => mockSelectChain([]));

    const result = await getCreatorBookViewTotals({
      creatorId: "creator-1",
      creatorType: "artist",
    });

    expect(result).toEqual({
      totalViews: 0,
      booksWithViews: 0,
    });
  });
});

describe("getCreatorFunnelTotals", () => {
  beforeEach(() => {
    selectMock.mockReset();
  });

  it("merges view, click, wishlist, and collection totals with click rate", async () => {
    selectMock
      .mockImplementationOnce(() => mockSelectChain([{ value: 200 }]))
      .mockImplementationOnce(() => mockSelectChain([{ value: 5 }]))
      .mockImplementationOnce(() => mockSelectChain([{ value: 40 }]))
      .mockImplementationOnce(() => mockSelectChain([{ value: 3 }]))
      .mockImplementationOnce(() => mockSelectChain([{ value: 12 }]))
      .mockImplementationOnce(() => mockSelectChain([{ value: 7 }]));

    const result = await getCreatorFunnelTotals({
      creatorId: "creator-1",
      creatorType: "publisher",
    });

    expect(result).toEqual({
      views: 200,
      booksWithViews: 5,
      outboundClicks: 40,
      booksWithClicks: 3,
      wishlists: 12,
      collections: 7,
      clickRate: 20,
    });
  });

  it("returns null click rate when there are no views", async () => {
    selectMock
      .mockImplementationOnce(() => mockSelectChain([{ value: 0 }]))
      .mockImplementationOnce(() => mockSelectChain([{ value: 0 }]))
      .mockImplementationOnce(() => mockSelectChain([{ value: 0 }]))
      .mockImplementationOnce(() => mockSelectChain([{ value: 0 }]))
      .mockImplementationOnce(() => mockSelectChain([{ value: 0 }]))
      .mockImplementationOnce(() => mockSelectChain([{ value: 0 }]));

    const result = await getCreatorFunnelTotals({
      creatorId: "creator-1",
      creatorType: "artist",
    });

    expect(result.clickRate).toBeNull();
    expect(result.views).toBe(0);
    expect(result.booksWithViews).toBe(0);
    expect(result.booksWithClicks).toBe(0);
  });
});

describe("getTopBooksByViews", () => {
  beforeEach(() => {
    selectMock.mockReset();
  });

  it("returns an empty result when no books have views", async () => {
    selectMock.mockImplementationOnce(() =>
      mockSelectChain([{ value: 0 }]),
    );

    const [error, result] = await getTopBooksByViews(
      null,
      1,
      10,
      { creatorId: "creator-1", creatorType: "publisher" },
    );

    expect(error).toBeNull();
    expect(result).toEqual({ books: [], totalPages: 1, page: 1 });
  });
});
