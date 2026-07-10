import { describe, expect, it } from "vitest";
import { persistedBookImageIds } from "./ids";

describe("persistedBookImageIds", () => {
  it("keeps persisted UUIDs and drops client placeholder ids", () => {
    const ids = [
      "39bfacdb-f6e8-43d0-a6e9-d091e45df20d",
      "new-1783693939120-0.7012271479332427",
    ];

    expect(persistedBookImageIds(ids)).toEqual([
      "39bfacdb-f6e8-43d0-a6e9-d091e45df20d",
    ]);
  });
});
