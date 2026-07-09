import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  getContentPreviewWeekStartForDate,
  getContentPreviewEmailScheduledDate,
} from "../../../features/dashboard/admin/planner/utils";
import { runContentPreviewEmail } from "./contentPreviewEmailServices";
import { toDateString } from "../../../lib/utils";

const ensureWeekPlannerContentMock = vi.fn();
const getWeekInstagramForPrepareMock = vi.fn();
const buildWeekSpotlightContentMock = vi.fn();
const persistWeekSpotlightContentMock = vi.fn();
const sendAdminEmailMock = vi.fn();
const findFirstMock = vi.fn();

vi.mock("./weekPrepServices", () => ({
  ensureWeekPlannerContent: (...args: unknown[]) =>
    ensureWeekPlannerContentMock(...args),
}));

vi.mock("../../../features/dashboard/admin/planner/instagramServices", () => ({
  getWeekInstagramForPrepare: (...args: unknown[]) =>
    getWeekInstagramForPrepareMock(...args),
}));

vi.mock("../../../features/dashboard/admin/planner/spotlightBlurb", async () => {
  const actual = await vi.importActual<
    typeof import("../../../features/dashboard/admin/planner/spotlightBlurb")
  >("../../../features/dashboard/admin/planner/spotlightBlurb");
  return {
    ...actual,
    buildWeekSpotlightContent: (...args: unknown[]) =>
      buildWeekSpotlightContentMock(...args),
    persistWeekSpotlightContent: (...args: unknown[]) =>
      persistWeekSpotlightContentMock(...args),
  };
});

vi.mock("../../../lib/sendEmail", () => ({
  sendAdminEmail: (...args: unknown[]) => sendAdminEmailMock(...args),
}));

vi.mock("../../../db/client", () => ({
  db: {
    query: {
      artistOfTheWeek: {
        findFirst: (...args: unknown[]) => findFirstMock(...args),
      },
    },
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn().mockResolvedValue(undefined),
      })),
    })),
  },
}));

describe("content preview scheduling", () => {
  it("targets the week that starts three days after Friday", () => {
    const friday = new Date(Date.UTC(2026, 6, 10));
    const weekStart = getContentPreviewWeekStartForDate(friday);

    expect(weekStart).not.toBeNull();
    expect(toDateString(weekStart!)).toBe("2026-07-13");
    expect(getContentPreviewEmailScheduledDate(weekStart!)).toEqual(friday);
  });

  it("returns null when not three days before week start", () => {
    const thursday = new Date(Date.UTC(2026, 6, 9));
    expect(getContentPreviewWeekStartForDate(thursday)).toBeNull();
  });
});

describe("runContentPreviewEmail", () => {
  beforeEach(() => {
    ensureWeekPlannerContentMock.mockReset();
    getWeekInstagramForPrepareMock.mockReset();
    buildWeekSpotlightContentMock.mockReset();
    persistWeekSpotlightContentMock.mockReset();
    sendAdminEmailMock.mockReset();
    findFirstMock.mockReset();
    findFirstMock.mockResolvedValue(null);

    ensureWeekPlannerContentMock.mockResolvedValue([
      null,
      {
        botdScheduled: 7,
        botdAutoFilled: true,
        artistAutoFilled: true,
        publisherAutoFilled: true,
        imagesSaved: 9,
        warnings: [],
      },
    ]);
    getWeekInstagramForPrepareMock.mockResolvedValue([
      null,
      {
        botdEntries: [{ date: new Date(Date.UTC(2026, 6, 13)), book: { title: "Book" } }],
        artistOfTheWeek: { creator: { displayName: "Artist" } },
        publisherOfTheWeek: null,
        artistBookCoverUrls: [],
        publisherBookCoverUrls: [],
      },
    ]);
    buildWeekSpotlightContentMock.mockResolvedValue([
      null,
      [
        {
          kind: "botd",
          date: new Date(Date.UTC(2026, 6, 13)),
          title: "Book",
          featuredImageUrl: "https://example.com/cover.jpg",
          sourceText: "Source",
          spotlightBlurb: "Rewritten",
          instagramCaption: "Caption",
        },
      ],
    ]);
    persistWeekSpotlightContentMock.mockResolvedValue([null, { saved: 1 }]);
    sendAdminEmailMock.mockResolvedValue([null]);
  });

  it("skips on non-reminder days", async () => {
    const [error, result] = await runContentPreviewEmail(
      new Date(Date.UTC(2026, 6, 9)),
    );

    expect(error).toBeNull();
    expect(result?.outcome).toEqual({
      status: "skipped",
      reason: "not_reminder_day",
    });
    expect(ensureWeekPlannerContentMock).not.toHaveBeenCalled();
  });

  it("prepares the week and sends on reminder day", async () => {
    const [error, result] = await runContentPreviewEmail(
      new Date(Date.UTC(2026, 6, 10)),
    );

    expect(error).toBeNull();
    expect(result?.previewEmailSent).toBe(true);
    expect(ensureWeekPlannerContentMock).toHaveBeenCalledOnce();
    expect(sendAdminEmailMock).toHaveBeenCalledOnce();
  });

  it("does not persist or send in dry run", async () => {
    const [error, result] = await runContentPreviewEmail(
      new Date(Date.UTC(2026, 6, 10)),
      { dryRun: true },
    );

    expect(error).toBeNull();
    expect(result?.previewEmailSent).toBe(false);
    expect(ensureWeekPlannerContentMock).not.toHaveBeenCalled();
    expect(persistWeekSpotlightContentMock).not.toHaveBeenCalled();
    expect(sendAdminEmailMock).not.toHaveBeenCalled();
  });

  it("still writes blurbs for prepared weeks when preview email was already sent", async () => {
    findFirstMock.mockResolvedValue({
      contentPreviewEmailSentAt: new Date(Date.UTC(2026, 6, 10)),
    });
    getWeekInstagramForPrepareMock.mockResolvedValue([
      null,
      {
        botdEntries: [
          {
            date: new Date(Date.UTC(2026, 6, 13)),
            spotlightBlurb: null,
            instagramPreparedAt: new Date(),
            instagramCaption: "Prepared caption",
            book: { title: "Book" },
          },
        ],
        artistOfTheWeek: {
          spotlightBlurb: "Existing artist blurb",
          creator: { displayName: "Artist" },
        },
        publisherOfTheWeek: null,
        artistBookCoverUrls: [],
        publisherBookCoverUrls: [],
      },
    ]);

    const [error, result] = await runContentPreviewEmail(
      new Date(Date.UTC(2026, 6, 10)),
    );

    expect(error).toBeNull();
    expect(result?.previewEmailSent).toBe(false);
    expect(buildWeekSpotlightContentMock).toHaveBeenCalledOnce();
    expect(persistWeekSpotlightContentMock).toHaveBeenCalledOnce();
    expect(sendAdminEmailMock).not.toHaveBeenCalled();
  });
});
