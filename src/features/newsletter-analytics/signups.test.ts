import { describe, expect, it } from "vitest";
import {
  buildDailySignupTrend,
  buildNewsletterSignupsDashboard,
  filterContactsInRange,
} from "./signups";

describe("newsletter signup analytics", () => {
  const range = {
    from: new Date("2026-03-01T00:00:00.000Z"),
    to: new Date("2026-03-03T00:00:00.000Z"),
  };

  it("filters contacts to the selected date range", () => {
    const contacts = filterContactsInRange(
      [
        { email: "a@example.com", createdAt: "2026-02-28T23:59:59.000Z" },
        { email: "b@example.com", createdAt: "2026-03-01T10:00:00.000Z" },
        { email: "c@example.com", createdAt: "2026-03-03T23:59:59.000Z" },
        { email: "d@example.com", createdAt: "2026-03-04T00:00:00.000Z" },
      ],
      range,
    );

    expect(contacts.map((contact) => contact.email)).toEqual([
      "b@example.com",
      "c@example.com",
    ]);
  });

  it("buckets signups by day", () => {
    const trend = buildDailySignupTrend(
      [
        { email: "a@example.com", createdAt: "2026-03-01T08:00:00.000Z" },
        { email: "b@example.com", createdAt: "2026-03-01T18:00:00.000Z" },
        { email: "c@example.com", createdAt: "2026-03-03T12:00:00.000Z" },
      ],
      range,
    );

    expect(trend).toEqual([
      { date: "2026-03-01", signups: 2 },
      { date: "2026-03-02", signups: 0 },
      { date: "2026-03-03", signups: 1 },
    ]);
  });

  it("builds a dashboard with Brevo list metadata", () => {
    const dashboard = buildNewsletterSignupsDashboard({
      listId: 42,
      listName: "Newsletter",
      usesDefaultRange: true,
      totalSubscribers: 128,
      contacts: [
        { email: "a@example.com", createdAt: "2026-03-01T08:00:00.000Z" },
      ],
      range,
    });

    expect(dashboard.totalSubscribers).toBe(128);
    expect(dashboard.overview.signupsInPeriod).toBe(1);
    expect(dashboard.brevoListUrl).toBe(
      "https://app.brevo.com/contact/list/listing/id/42",
    );
  });
});
