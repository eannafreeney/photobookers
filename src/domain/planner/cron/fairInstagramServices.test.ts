import { describe, expect, it, vi, beforeEach } from "vitest";

const {
  findManyMock,
  updateMock,
  bufferCreateScheduledImagePostMock,
} = vi.hoisted(() => ({
  findManyMock: vi.fn(),
  updateMock: vi.fn(),
  bufferCreateScheduledImagePostMock: vi.fn(),
}));

vi.mock("../../../db/client", () => ({
  db: {
    query: {
      bookFairs: { findMany: findManyMock },
    },
    update: updateMock,
  },
}));

vi.mock(
  "../../../features/dashboard/admin/planner/social-media/buffer",
  () => ({
    bufferCreateScheduledImagePost: bufferCreateScheduledImagePostMock,
  }),
);

import {
  buildFairInstagramDueAt,
  getFairInstagramTargetStartDay,
  runFairInstagramCron,
} from "./fairInstagramServices";
import { ok } from "../../../lib/result";

describe("getFairInstagramTargetStartDay", () => {
  it("returns UTC start of day three days ahead", () => {
    const from = new Date("2026-07-24T15:30:00.000Z");
    const target = getFairInstagramTargetStartDay(from);
    expect(target.toISOString()).toBe("2026-07-27T00:00:00.000Z");
  });
});

describe("buildFairInstagramDueAt", () => {
  it("uses FAIR_INSTAGRAM_POST_TIME on the run day", () => {
    const prev = process.env.FAIR_INSTAGRAM_POST_TIME;
    process.env.FAIR_INSTAGRAM_POST_TIME = "16:30";
    const due = buildFairInstagramDueAt(new Date("2026-07-24T08:00:00.000Z"));
    expect(due.toISOString()).toBe("2026-07-24T16:30:00.000Z");
    process.env.FAIR_INSTAGRAM_POST_TIME = prev;
  });
});

describe("runFairInstagramCron", () => {
  beforeEach(() => {
    findManyMock.mockReset();
    updateMock.mockReset();
    bufferCreateScheduledImagePostMock.mockReset();
    updateMock.mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    });
  });

  it("queues published fairs starting in 3 days that have a cover", async () => {
    findManyMock.mockResolvedValue([
      {
        id: "fair-1",
        slug: "arles-books-fair-2026",
        name: "Arles Books Fair",
        description: "Eighty international publishing houses.",
        city: "Arles",
        country: "France",
        coverUrl: "https://example.com/cover.jpg",
        startDate: new Date("2026-07-27T00:00:00.000Z"),
        endDate: new Date("2026-07-31T00:00:00.000Z"),
      },
    ]);
    bufferCreateScheduledImagePostMock.mockResolvedValue(
      ok({ postId: "buffer-1" }),
    );

    const [error, result] = await runFairInstagramCron({
      date: new Date("2026-07-24T08:17:00.000Z"),
    });

    expect(error).toBeNull();
    expect(result?.targetStartDate).toBe("2026-07-27");
    expect(result?.queued).toBe(1);
    expect(result?.items[0]?.outcome).toEqual({
      status: "queued",
      postId: "buffer-1",
    });
    expect(bufferCreateScheduledImagePostMock).toHaveBeenCalledOnce();
  });

  it("skips fairs without a cover", async () => {
    findManyMock.mockResolvedValue([
      {
        id: "fair-2",
        slug: "no-cover-fair",
        name: "No Cover Fair",
        description: null,
        city: "Berlin",
        country: "Germany",
        coverUrl: null,
        startDate: new Date("2026-07-27T00:00:00.000Z"),
        endDate: new Date("2026-07-28T00:00:00.000Z"),
      },
    ]);

    const [error, result] = await runFairInstagramCron({
      date: new Date("2026-07-24T08:17:00.000Z"),
    });

    expect(error).toBeNull();
    expect(result?.skipped).toBe(1);
    expect(result?.items[0]?.outcome).toEqual({
      status: "skipped",
      reason: "no_cover",
    });
    expect(bufferCreateScheduledImagePostMock).not.toHaveBeenCalled();
  });

  it("dryRun does not call Buffer", async () => {
    findManyMock.mockResolvedValue([
      {
        id: "fair-3",
        slug: "dry-run-fair",
        name: "Dry Run Fair",
        description: null,
        city: null,
        country: null,
        coverUrl: "https://example.com/cover.jpg",
        startDate: new Date("2026-07-27T00:00:00.000Z"),
        endDate: new Date("2026-07-28T00:00:00.000Z"),
      },
    ]);

    const [error, result] = await runFairInstagramCron({
      dryRun: true,
      date: new Date("2026-07-24T08:17:00.000Z"),
    });

    expect(error).toBeNull();
    expect(result?.items[0]?.outcome).toEqual({ status: "dry_run" });
    expect(bufferCreateScheduledImagePostMock).not.toHaveBeenCalled();
  });
});
