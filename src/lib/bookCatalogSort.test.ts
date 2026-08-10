import { describe, expect, it } from "vitest";
import {
  BOOK_CATALOG_DEFAULT_SORT,
  BOOK_CATALOG_TRENDING_DAYS,
  catalogTrendingSince,
} from "./bookCatalogSort";

describe("bookCatalogSort", () => {
  it("defaults catalog listings to trending", () => {
    expect(BOOK_CATALOG_DEFAULT_SORT).toBe("trending");
  });

  it("counts trending views over the last 7 days", () => {
    expect(BOOK_CATALOG_TRENDING_DAYS).toBe(7);
    const now = new Date("2026-08-10T12:00:00.000Z");
    const since = catalogTrendingSince(now);
    expect(since.toISOString()).toBe("2026-08-03T12:00:00.000Z");
  });
});
