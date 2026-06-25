import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  getInstagramPrepReminderWeekStartForDate,
  runInstagramPrepReminderEmail,
} from "./instagramReminderEmailServices";
import { getWeekInstagramPrepGaps } from "./instagramUtils";
import { getInstagramPrepReminderScheduledDate } from "./utils";
import { toDateString } from "../../../../lib/utils";
import { getWeekDays } from "./utils";

const getWeekInstagramForPrepareMock = vi.fn();
const sendAdminEmailMock = vi.fn();

vi.mock("./instagramServices", () => ({
  getWeekInstagramForPrepare: (...args: unknown[]) =>
    getWeekInstagramForPrepareMock(...args),
}));

vi.mock("../../../../lib/sendEmail", () => ({
  sendAdminEmail: (...args: unknown[]) => sendAdminEmailMock(...args),
}));

describe("Instagram prep reminder scheduling", () => {
  it("targets the week that starts two days after Saturday", () => {
    const saturday = new Date(Date.UTC(2026, 5, 27));
    const weekStart = getInstagramPrepReminderWeekStartForDate(saturday);

    expect(weekStart).not.toBeNull();
    expect(toDateString(weekStart!)).toBe("2026-06-29");
    expect(getInstagramPrepReminderScheduledDate(weekStart!)).toEqual(saturday);
  });

  it("returns null when not two days before week start", () => {
    const friday = new Date(Date.UTC(2026, 5, 26));
    expect(getInstagramPrepReminderWeekStartForDate(friday)).toBeNull();
  });
});

describe("getWeekInstagramPrepGaps", () => {
  it("lists scheduled but unprepared items", () => {
    const weekStart = new Date(Date.UTC(2026, 5, 29));
    const days = getWeekDays(weekStart);
    const byDate = new Map([
      [toDateString(days[0]), { instagramPreparedAt: new Date() }],
      [toDateString(days[1]), { instagramPreparedAt: null }],
    ]);

    const gaps = getWeekInstagramPrepGaps(weekStart, byDate, {
      artistOfTheWeek: { instagramPreparedAt: null },
      publisherOfTheWeek: { instagramPreparedAt: new Date() },
    });

    expect(gaps).toEqual([
      { kind: "botd", date: days[1] },
      { kind: "artist" },
    ]);
  });
});

describe("runInstagramPrepReminderEmail", () => {
  beforeEach(() => {
    getWeekInstagramForPrepareMock.mockReset();
    sendAdminEmailMock.mockReset();
    sendAdminEmailMock.mockResolvedValue([null]);
  });

  it("skips on non-reminder days", async () => {
    const [error, result] = await runInstagramPrepReminderEmail(
      new Date(Date.UTC(2026, 5, 26)),
    );

    expect(error).toBeNull();
    expect(result?.outcome).toEqual({
      status: "skipped",
      reason: "not_reminder_day",
    });
    expect(getWeekInstagramForPrepareMock).not.toHaveBeenCalled();
  });

  it("sends when scheduled content is not fully prepared", async () => {
    const weekStart = new Date(Date.UTC(2026, 5, 29));
    const days = getWeekDays(weekStart);

    getWeekInstagramForPrepareMock.mockResolvedValue([
      null,
      {
        botdEntries: [
          { date: days[0], instagramPreparedAt: null },
          { date: days[1], instagramPreparedAt: new Date() },
        ],
        artistOfTheWeek: null,
        publisherOfTheWeek: null,
      },
    ]);

    const [error, result] = await runInstagramPrepReminderEmail(
      new Date(Date.UTC(2026, 5, 27)),
    );

    expect(error).toBeNull();
    expect(result?.reminderEmailSent).toBe(true);
    expect(result?.outcome).toEqual({ status: "sent" });
    expect(sendAdminEmailMock).toHaveBeenCalledOnce();
    expect(sendAdminEmailMock.mock.calls[0][0]).toContain("2026-W27");
  });

  it("skips when everything is prepared", async () => {
    const weekStart = new Date(Date.UTC(2026, 5, 29));
    const days = getWeekDays(weekStart);

    getWeekInstagramForPrepareMock.mockResolvedValue([
      null,
      {
        botdEntries: [{ date: days[0], instagramPreparedAt: new Date() }],
        artistOfTheWeek: null,
        publisherOfTheWeek: null,
      },
    ]);

    const [error, result] = await runInstagramPrepReminderEmail(
      new Date(Date.UTC(2026, 5, 27)),
    );

    expect(error).toBeNull();
    expect(result?.outcome).toEqual({
      status: "skipped",
      reason: "fully_prepared",
    });
    expect(sendAdminEmailMock).not.toHaveBeenCalled();
  });
});
