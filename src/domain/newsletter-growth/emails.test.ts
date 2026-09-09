import { describe, expect, it } from "vitest";
import { formatRatePercent, newsletterGrowthRange, ratePercent } from "./format";
import { parseBrevoCampaignStats, pickLatestSentCampaign } from "./brevoCampaignStats";
import { newsletterGrowthEmailSubject } from "./emails";
import { formatPeriodDelta } from "../ceo-metrics/format";
import type { NewsletterGrowthReport } from "./types";

describe("ratePercent", () => {
  it("returns one-decimal unique rates", () => {
    expect(ratePercent(40, 100)).toBe(40);
    expect(ratePercent(1, 3)).toBe(33.3);
    expect(ratePercent(10, 0)).toBeNull();
  });
});

describe("parseBrevoCampaignStats", () => {
  it("maps globalStats unique views to open rate", () => {
    const stats = parseBrevoCampaignStats({
      id: 9,
      name: "Weekly BOTD",
      subject: "This week’s books",
      sentDate: "2026-09-03T09:17:00.000Z",
      status: "sent",
      statistics: {
        globalStats: {
          sent: 240,
          delivered: 238,
          uniqueViews: 95,
          uniqueClicks: 95,
          unsubscriptions: 1,
        },
      },
    });

    expect(stats?.openRate).toBe(39.9);
    expect(stats?.clickRate).toBe(39.9);
    expect(formatRatePercent(stats?.openRate ?? null)).toBe("39.9%");
  });
});

describe("pickLatestSentCampaign", () => {
  it("skips drafts and takes the first sent campaign", () => {
    const picked = pickLatestSentCampaign([
      { id: 1, status: "draft", statistics: { globalStats: { delivered: 1 } } },
      {
        id: 2,
        status: "sent",
        subject: "Live",
        statistics: { globalStats: { delivered: 10, uniqueViews: 4 } },
      },
    ]);
    expect(picked?.id).toBe(2);
    expect(picked?.subject).toBe("Live");
  });
});

describe("newsletterGrowthRange", () => {
  it("covers seven UTC days ending on as-of", () => {
    const range = newsletterGrowthRange(new Date("2026-09-04T10:17:00.000Z"));
    expect(range.from.toISOString()).toBe("2026-08-29T00:00:00.000Z");
    expect(range.to.toISOString()).toBe("2026-09-04T00:00:00.000Z");
  });
});

describe("newsletterGrowthEmailSubject", () => {
  it("leads with list size and weekly signups", () => {
    const range = {
      from: new Date("2026-08-28T00:00:00.000Z"),
      to: new Date("2026-09-03T00:00:00.000Z"),
    };
    const report: NewsletterGrowthReport = {
      range,
      previousRange: range,
      totalSubscribers: 248,
      signupsThisWeek: 8,
      signupsLastWeek: 5,
      signupsDelta: formatPeriodDelta(8, 5),
      campaign: null,
      editorialBuyClicks: 3,
      editorialBuyClicksDelta: formatPeriodDelta(3, 2),
      botdPageBuyClicks: 1,
      botdBookBuyClicks: 4,
      allBuyClicks: 12,
    };
    expect(newsletterGrowthEmailSubject(report)).toBe(
      "Photobookers list — 248 subs · +8 this week",
    );
  });
});
