import { afterEach, describe, expect, it, vi } from "vitest";
import type { NewsletterCampaign } from "../../../../db/schema";
import {
  runWeeklyNewsletterCron,
  WEEKLY_NEWSLETTER_REQUIRED_BOOKS,
} from "./newsletterCronServices";

vi.mock("./newsletterServices", () => ({
  ensureCurrentWeeklyNewsletterDraft: vi.fn(),
  ensureWeeklyNewsletterDraftForRange: vi.fn(),
  getWeekEndDate: vi.fn(),
  normalizeWeekStartDate: vi.fn((d: Date) => d),
  regenerateCampaignContent: vi.fn(),
  updateNewsletterCampaignDraft: vi.fn(),
}));

vi.mock("./newsletterBrevoServices", () => ({
  isBrevoNewsletterConfigured: vi.fn(),
  sendNewsletterBrevoToList: vi.fn(),
}));

import {
  ensureCurrentWeeklyNewsletterDraft,
  regenerateCampaignContent,
  updateNewsletterCampaignDraft,
} from "./newsletterServices";
import {
  isBrevoNewsletterConfigured,
  sendNewsletterBrevoToList,
} from "./newsletterBrevoServices";

const makeSampleCampaign = (
  overrides: Partial<NewsletterCampaign> = {},
): NewsletterCampaign => ({
  id: "campaign-1",
  weekStart: new Date(Date.UTC(2026, 4, 26)),
  weekEnd: new Date(Date.UTC(2026, 5, 1)),
  status: "draft",
  templateKey: "weekly_botd_v1",
  templateVersion: 1,
  subject: "This week on photobookers",
  introText: "Intro",
  outroText: "Outro",
  ctaText: "Visit photobookers",
  generatedContent: null,
  sentAt: null,
  createdAt: new Date(Date.UTC(2026, 4, 20)),
  updatedAt: null,
  ...overrides,
});

const sampleCampaign = makeSampleCampaign();

const sampleGenerated = {
  generatedAt: new Date().toISOString(),
  items: Array.from({ length: WEEKLY_NEWSLETTER_REQUIRED_BOOKS }, (_, i) => ({
    date: `2026-05-${26 + i}`,
    bookId: `book-${i}`,
    bookSlug: `book-${i}`,
    title: `Book ${i}`,
    coverUrl: null,
    artistName: null,
    artistSlug: null,
    publisherName: null,
    publisherSlug: null,
  })),
  newMembers: [],
  artistOfTheWeek: null,
  publisherOfTheWeek: null,
};

describe("runWeeklyNewsletterCron", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("skips on non-Wednesday unless forced", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(Date.UTC(2026, 5, 5)));

    const [error, result] = await runWeeklyNewsletterCron();
    expect(error).toBeNull();
    expect(result).toEqual({ action: "skipped", reason: "not_wednesday" });
    expect(ensureCurrentWeeklyNewsletterDraft).not.toHaveBeenCalled();

    vi.useRealTimers();
  });

  it("skips when the campaign was already sent", async () => {
    vi.mocked(ensureCurrentWeeklyNewsletterDraft).mockResolvedValue([
      null,
      makeSampleCampaign({ status: "sent" }),
    ]);

    const [error, result] = await runWeeklyNewsletterCron();
    expect(error).toBeNull();
    expect(result).toEqual({
      action: "skipped",
      campaignId: "campaign-1",
      weekStart: "2026-05-26",
      reason: "already_sent",
    });
    expect(regenerateCampaignContent).not.toHaveBeenCalled();
  });

  it("errors when fewer than 7 books are scheduled", async () => {
    vi.mocked(ensureCurrentWeeklyNewsletterDraft).mockResolvedValue([
      null,
      sampleCampaign,
    ]);
    vi.mocked(regenerateCampaignContent).mockResolvedValue([
      null,
      {
        ...sampleGenerated,
        items: sampleGenerated.items.slice(0, 5),
      },
    ]);

    const [error] = await runWeeklyNewsletterCron();
    expect(error?.reason).toContain("Expected 7 books");
  });

  it("dry run regenerates content without sending", async () => {
    vi.mocked(ensureCurrentWeeklyNewsletterDraft).mockResolvedValue([
      null,
      sampleCampaign,
    ]);
    vi.mocked(regenerateCampaignContent).mockResolvedValue([
      null,
      sampleGenerated,
    ]);

    const [error, result] = await runWeeklyNewsletterCron({ dryRun: true });
    expect(error).toBeNull();
    expect(result).toEqual({
      action: "dry_run",
      campaignId: "campaign-1",
      weekStart: "2026-05-26",
      bookCount: 7,
    });
    expect(isBrevoNewsletterConfigured).not.toHaveBeenCalled();
    expect(sendNewsletterBrevoToList).not.toHaveBeenCalled();
  });

  it("sends via Brevo when configured", async () => {
    vi.mocked(ensureCurrentWeeklyNewsletterDraft).mockResolvedValue([
      null,
      sampleCampaign,
    ]);
    vi.mocked(regenerateCampaignContent).mockResolvedValue([
      null,
      sampleGenerated,
    ]);
    vi.mocked(isBrevoNewsletterConfigured).mockReturnValue(true);
    vi.mocked(sendNewsletterBrevoToList).mockResolvedValue([
      null,
      {
        brevoCampaignId: 99,
        mode: "send",
        campaign: makeSampleCampaign({ status: "sent" }),
      },
    ]);

    const [error, result] = await runWeeklyNewsletterCron();
    expect(error).toBeNull();
    expect(result).toEqual({
      action: "sent",
      campaignId: "campaign-1",
      weekStart: "2026-05-26",
      bookCount: 7,
      brevoCampaignId: 99,
    });
    expect(sendNewsletterBrevoToList).toHaveBeenCalledWith("campaign-1");
  });

  it("marks the campaign failed when Brevo send fails", async () => {
    vi.mocked(ensureCurrentWeeklyNewsletterDraft).mockResolvedValue([
      null,
      sampleCampaign,
    ]);
    vi.mocked(regenerateCampaignContent).mockResolvedValue([
      null,
      sampleGenerated,
    ]);
    vi.mocked(isBrevoNewsletterConfigured).mockReturnValue(true);
    vi.mocked(sendNewsletterBrevoToList).mockResolvedValue([
      { reason: "Brevo API request failed" },
      null,
    ]);
    vi.mocked(updateNewsletterCampaignDraft).mockResolvedValue([
      null,
      makeSampleCampaign({ status: "failed" }),
    ]);

    const [error] = await runWeeklyNewsletterCron();
    expect(error?.reason).toBe("Brevo API request failed");
    expect(updateNewsletterCampaignDraft).toHaveBeenCalledWith("campaign-1", {
      status: "failed",
    });
  });
});
