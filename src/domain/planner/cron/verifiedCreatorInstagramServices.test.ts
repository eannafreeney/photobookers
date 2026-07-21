import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const findManyMock = vi.fn();
const selectMock = vi.fn();
const updateMock = vi.fn();

vi.mock("../../../db/client", () => ({
  db: {
    query: { creators: { findMany: (...args: unknown[]) => findManyMock(...args) } },
    select: (...args: unknown[]) => selectMock(...args),
    update: (...args: unknown[]) => updateMock(...args),
  },
}));

vi.mock("../../../features/app/services", () => ({
  getCreatorSpotlightImageUrls: vi.fn().mockResolvedValue([null, ["https://example.com/cover.jpg"]]),
}));

vi.mock("../../../services/storage", () => ({
  uploadImageFromBuffer: vi.fn().mockResolvedValue({ url: "https://example.com/uploaded.webp" }),
}));

vi.mock("../../../domain/planner/instagramSlides/getCreatorBookCoverUrls", () => ({
  getCreatorBookCoverUrls: vi.fn().mockResolvedValue(["https://example.com/book.jpg"]),
}));

vi.mock("../../../domain/planner/instagramSlides/renderSpotlightLeadSlide", () => ({
  NEW_CREATOR_CAROUSEL_BOOK_LIMIT: 5,
  prepareNewCreatorFeedImageUrls: vi
    .fn()
    .mockResolvedValue(["https://example.com/lead.webp", "https://example.com/book.jpg"]),
}));

vi.mock("../../../lib/sendEmail", () => ({
  sendAdminEmail: vi.fn().mockResolvedValue([null, undefined]),
  sendEmail: vi.fn().mockResolvedValue([null, undefined]),
}));

const bufferCreateScheduledImagePostMock = vi.fn();

vi.mock("../../../features/dashboard/admin/planner/social-media/buffer", () => ({
  bufferCreateScheduledImagePost: (...args: unknown[]) =>
    bufferCreateScheduledImagePostMock(...args),
}));

let getVerifiedCreatorInstagramEligibleBefore: typeof import("./verifiedCreatorInstagramServices").getVerifiedCreatorInstagramEligibleBefore;
let runVerifiedCreatorInstagramCron: typeof import("./verifiedCreatorInstagramServices").runVerifiedCreatorInstagramCron;

function makeCreatorRow(id: string, verifiedAt: Date) {
  return {
    id,
    slug: `creator-${id}`,
    type: "artist" as const,
    displayName: `Creator ${id}`,
    coverUrl: "https://example.com/cover.jpg",
    verifiedAt,
    email: `creator-${id}@example.com`,
    owner: { email: `owner-${id}@example.com` },
    booksAsArtist: [{ id: "book-1" }],
    booksAsPublisher: [],
  };
}

function mockQueuedTodayCount(count: number) {
  selectMock.mockReturnValue({
    from: vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue([{ value: count }]),
    }),
  });
}

beforeAll(async () => {
  process.env.AUTH_SECRET = "test-secret";
  ({ getVerifiedCreatorInstagramEligibleBefore, runVerifiedCreatorInstagramCron } =
    await import("./verifiedCreatorInstagramServices"));
});

beforeEach(() => {
  findManyMock.mockReset();
  selectMock.mockReset();
  updateMock.mockReset();
  bufferCreateScheduledImagePostMock.mockReset();

  updateMock.mockReturnValue({
    set: vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    }),
  });
  bufferCreateScheduledImagePostMock.mockResolvedValue([
    null,
    { postId: "buffer-post-1" },
  ]);
});

describe("getVerifiedCreatorInstagramEligibleBefore", () => {
  it("returns 2 days before the provided time", () => {
    const now = new Date(Date.UTC(2026, 6, 10, 11, 0, 0));
    expect(getVerifiedCreatorInstagramEligibleBefore(now).toISOString()).toBe(
      "2026-07-08T11:00:00.000Z",
    );
  });
});

describe("isVerifiedCreatorInstagramRunDay", () => {
  it("runs on Monday and Wednesday UTC", async () => {
    const { isVerifiedCreatorInstagramRunDay } = await import(
      "./verifiedCreatorInstagramServices"
    );
    // 2026-07-13 is a Monday, 2026-07-15 a Wednesday.
    expect(
      isVerifiedCreatorInstagramRunDay(new Date(Date.UTC(2026, 6, 13))),
    ).toBe(true);
    expect(
      isVerifiedCreatorInstagramRunDay(new Date(Date.UTC(2026, 6, 15))),
    ).toBe(true);
    // Tuesday / Thursday are post days, not run days.
    expect(
      isVerifiedCreatorInstagramRunDay(new Date(Date.UTC(2026, 6, 14))),
    ).toBe(false);
    expect(
      isVerifiedCreatorInstagramRunDay(new Date(Date.UTC(2026, 6, 16))),
    ).toBe(false);
  });
});

describe("runVerifiedCreatorInstagramCron", () => {
  // 2026-07-15 is a Wednesday — a verified-creator run day.
  const RUN_DAY = new Date(Date.UTC(2026, 6, 15, 11, 0, 0));

  it("queues only one creator per run even when more are eligible", async () => {
    mockQueuedTodayCount(0);
    findManyMock.mockResolvedValue([
      makeCreatorRow("1", new Date(Date.UTC(2026, 6, 1))),
      makeCreatorRow("2", new Date(Date.UTC(2026, 6, 2))),
      makeCreatorRow("3", new Date(Date.UTC(2026, 6, 3))),
    ]);

    const [error, result] = await runVerifiedCreatorInstagramCron({
      date: RUN_DAY,
    });
    expect(error).toBeNull();
    expect(result?.queued).toBe(1);
    expect(bufferCreateScheduledImagePostMock).toHaveBeenCalledTimes(1);
  });

  it("returns early when the daily limit is already reached", async () => {
    mockQueuedTodayCount(1);

    const [error, result] = await runVerifiedCreatorInstagramCron({
      date: RUN_DAY,
    });
    expect(error).toBeNull();
    expect(result).toEqual({ queued: 0, skipped: 0, failed: 0, items: [] });
    expect(findManyMock).not.toHaveBeenCalled();
  });

  it("emails the creator (preferring creators.email) when a post is queued", async () => {
    mockQueuedTodayCount(0);
    findManyMock.mockResolvedValue([
      makeCreatorRow("1", new Date(Date.UTC(2026, 6, 1))),
    ]);

    const { sendEmail } = await import("../../../lib/sendEmail");
    const [error, result] = await runVerifiedCreatorInstagramCron({
      date: RUN_DAY,
    });
    expect(error).toBeNull();
    expect(result?.queued).toBe(1);
    expect(sendEmail).toHaveBeenCalledWith(
      "creator-1@example.com",
      expect.any(String),
      expect.any(String),
    );
  });

  it("does not run on a non-run day", async () => {
    // 2026-07-14 is a Tuesday (a post day, not a run day).
    const [error, result] = await runVerifiedCreatorInstagramCron({
      date: new Date(Date.UTC(2026, 6, 14, 11, 0, 0)),
    });
    expect(error).toBeNull();
    expect(result).toEqual({ queued: 0, skipped: 0, failed: 0, items: [] });
    expect(findManyMock).not.toHaveBeenCalled();
  });
});
