import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("../../../db/client", () => ({
  db: { query: { creators: { findMany: vi.fn() } } },
}));

vi.mock("../../../features/app/services", () => ({
  getCreatorSpotlightImageUrls: vi.fn(),
}));

vi.mock("../../../features/dashboard/admin/planner/buffer", () => ({
  bufferCreateScheduledImagePost: vi.fn(),
}));

let getVerifiedCreatorInstagramCutoff: typeof import("./verifiedCreatorInstagramServices").getVerifiedCreatorInstagramCutoff;

beforeAll(async () => {
  ({ getVerifiedCreatorInstagramCutoff } = await import(
    "./verifiedCreatorInstagramServices"
  ));
});

describe("getVerifiedCreatorInstagramCutoff", () => {
  it("returns 24 hours before the provided time", () => {
    const now = new Date(Date.UTC(2026, 6, 2, 9, 30, 0));
    expect(getVerifiedCreatorInstagramCutoff(now).toISOString()).toBe(
      "2026-07-01T09:30:00.000Z",
    );
  });
});
