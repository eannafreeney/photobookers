import { beforeEach, describe, expect, it, vi } from "vitest";
import { presetAnalyticsDateRange } from "../book-analytics/dateRange";

const { selectMock } = vi.hoisted(() => ({
  selectMock: vi.fn(),
}));

vi.mock("../../db/client", () => ({
  db: {
    select: selectMock,
  },
}));

import { getBookViewTotals } from "./services";

function mockSelectChain(
  result: unknown,
  options?: { resolveFrom?: boolean },
) {
  const chain = {
    from: options?.resolveFrom
      ? vi.fn().mockResolvedValue(result)
      : vi.fn().mockReturnThis(),
    where: vi.fn().mockResolvedValue(result),
  };
  return chain;
}

describe("getBookViewTotals", () => {
  beforeEach(() => {
    selectMock.mockReset();
  });

  it("returns total views and distinct books with views", async () => {
    selectMock
      .mockImplementationOnce(() => mockSelectChain([{ value: 120 }], { resolveFrom: true }))
      .mockImplementationOnce(() => mockSelectChain([{ value: 4 }], { resolveFrom: true }));

    const result = await getBookViewTotals();

    expect(result).toEqual({
      totalViews: 120,
      booksWithViews: 4,
    });
    expect(selectMock).toHaveBeenCalledTimes(2);
  });

  it("applies the date filter to both count queries", async () => {
    const range = presetAnalyticsDateRange(7);
    selectMock
      .mockImplementationOnce(() => mockSelectChain([{ value: 40 }]))
      .mockImplementationOnce(() => mockSelectChain([{ value: 3 }]));

    const result = await getBookViewTotals(range);

    expect(result).toEqual({
      totalViews: 40,
      booksWithViews: 3,
    });

    const totalQuery = selectMock.mock.results[0]?.value;
    const distinctQuery = selectMock.mock.results[1]?.value;
    expect(totalQuery.where).toHaveBeenCalledTimes(1);
    expect(distinctQuery.where).toHaveBeenCalledTimes(1);
    expect(totalQuery.where.mock.calls[0]?.[0]).toBe(
      distinctQuery.where.mock.calls[0]?.[0],
    );
  });

  it("defaults missing counts to zero", async () => {
    selectMock
      .mockImplementationOnce(() => mockSelectChain([]))
      .mockImplementationOnce(() => mockSelectChain([]));

    const result = await getBookViewTotals(presetAnalyticsDateRange(30));

    expect(result).toEqual({
      totalViews: 0,
      booksWithViews: 0,
    });
  });
});
