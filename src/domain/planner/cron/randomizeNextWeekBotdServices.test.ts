import { describe, expect, it, vi, beforeEach } from "vitest";

const { countMock, fromMock, whereMock, randomizeMock } = vi.hoisted(() => ({
  countMock: vi.fn(),
  fromMock: vi.fn(),
  whereMock: vi.fn(),
  randomizeMock: vi.fn(),
}));

vi.mock("../../../db/client", () => ({
  db: {
    select: vi.fn(() => ({
      from: fromMock,
    })),
  },
}));

vi.mock("../../../features/dashboard/admin/planner/services", () => ({
  randomizeBooksOfTheDayForWeek: randomizeMock,
}));

import { ok } from "../../../lib/result";
import {
  getFollowingWeekStart,
  isSaturdayUtc,
  runRandomizeNextWeekBotdCron,
} from "./randomizeNextWeekBotdServices";

describe("getFollowingWeekStart", () => {
  it("returns the Monday after the current ISO week", () => {
    // Saturday 25 Jul 2026 UTC → current week Mon 20 Jul → following Mon 27 Jul
    const next = getFollowingWeekStart(new Date("2026-07-25T12:00:00.000Z"));
    expect(next.toISOString()).toBe("2026-07-27T00:00:00.000Z");
  });
});

describe("isSaturdayUtc", () => {
  it("detects Saturday", () => {
    expect(isSaturdayUtc(new Date("2026-07-25T08:00:00.000Z"))).toBe(true);
    expect(isSaturdayUtc(new Date("2026-07-24T08:00:00.000Z"))).toBe(false);
  });
});

describe("runRandomizeNextWeekBotdCron", () => {
  beforeEach(() => {
    countMock.mockReset();
    fromMock.mockReset();
    whereMock.mockReset();
    randomizeMock.mockReset();
    fromMock.mockReturnValue({ where: whereMock });
    whereMock.mockResolvedValue([{ value: 0 }]);
  });

  it("skips when not Saturday unless forced", async () => {
    const [error, result] = await runRandomizeNextWeekBotdCron({
      date: new Date("2026-07-24T08:00:00.000Z"),
    });
    expect(error).toBeNull();
    expect(result?.outcome).toEqual({
      status: "skipped",
      reason: "not_saturday",
    });
    expect(randomizeMock).not.toHaveBeenCalled();
  });

  it("skips when the following week already has BOTDs", async () => {
    whereMock.mockResolvedValue([{ value: 3 }]);
    const [error, result] = await runRandomizeNextWeekBotdCron({
      force: true,
      date: new Date("2026-07-25T08:00:00.000Z"),
    });
    expect(error).toBeNull();
    expect(result?.outcome).toEqual({
      status: "skipped",
      reason: "week_already_has_botd",
    });
    expect(randomizeMock).not.toHaveBeenCalled();
  });

  it("calls randomize when Saturday and week is empty", async () => {
    randomizeMock.mockResolvedValue(ok({ scheduled: 7 }));
    const [error, result] = await runRandomizeNextWeekBotdCron({
      date: new Date("2026-07-25T08:00:00.000Z"),
    });
    expect(error).toBeNull();
    expect(result?.weekKey).toBe("2026-W31");
    expect(result?.outcome).toEqual({ status: "scheduled", scheduled: 7 });
    expect(randomizeMock).toHaveBeenCalledOnce();
  });
});
