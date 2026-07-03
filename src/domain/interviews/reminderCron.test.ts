import { describe, expect, it } from "vitest";
import {
  buildInterviewOpenReminderEmail,
  interviewOpenReminderSubject,
} from "./emails";
import {
  isDueForInterviewReminder,
  pickInterviewsForReminder,
  reminderAnchorDate,
  REMINDER_INTERVAL_DAYS,
  type OpenInterviewRow,
} from "./reminderCronUtils";

function row(
  overrides: Partial<OpenInterviewRow> & Pick<OpenInterviewRow, "id" | "creatorId">,
): OpenInterviewRow {
  return {
    creatorSlug: "jane-doe",
    recipientEmail: "jane@example.com",
    inviteToken: "token",
    invitedAt: new Date("2026-01-01"),
    reminderSentAt: null,
    creatorDisplayName: "Jane Doe",
    ...overrides,
  };
}

describe("reminderAnchorDate", () => {
  it("uses invitedAt when no reminder has been sent", () => {
    expect(
      reminderAnchorDate({
        invitedAt: new Date("2026-01-01"),
        reminderSentAt: null,
      }).toISOString(),
    ).toBe(new Date("2026-01-01").toISOString());
  });

  it("uses reminderSentAt when present", () => {
    expect(
      reminderAnchorDate({
        invitedAt: new Date("2026-01-01"),
        reminderSentAt: new Date("2026-02-01"),
      }).toISOString(),
    ).toBe(new Date("2026-02-01").toISOString());
  });
});

describe("isDueForInterviewReminder", () => {
  const runDate = new Date(Date.UTC(2026, 1, 15));

  it("is due when the invite is older than the interval", () => {
    expect(
      isDueForInterviewReminder(
        row({
          id: "a",
          creatorId: "c1",
          invitedAt: new Date(Date.UTC(2026, 0, 1)),
        }),
        runDate,
      ),
    ).toBe(true);
  });

  it("is not due when the last reminder was recent", () => {
    expect(
      isDueForInterviewReminder(
        row({
          id: "a",
          creatorId: "c1",
          invitedAt: new Date(Date.UTC(2025, 10, 1)),
          reminderSentAt: new Date(Date.UTC(2026, 1, 10)),
        }),
        runDate,
      ),
    ).toBe(false);
  });

  it("respects force for testing", () => {
    expect(
      isDueForInterviewReminder(
        row({
          id: "a",
          creatorId: "c1",
          invitedAt: new Date(Date.UTC(2026, 1, 14)),
        }),
        runDate,
        REMINDER_INTERVAL_DAYS,
        true,
      ),
    ).toBe(true);
  });
});

describe("pickInterviewsForReminder", () => {
  it("keeps only the latest open invite per creator", () => {
    const picked = pickInterviewsForReminder([
      row({
        id: "a",
        creatorId: "c1",
        invitedAt: new Date("2026-01-01"),
      }),
      row({
        id: "b",
        creatorId: "c1",
        invitedAt: new Date("2026-02-01"),
      }),
      row({
        id: "c",
        creatorId: "c2",
        invitedAt: new Date("2026-01-15"),
      }),
    ]);

    expect(picked.map((r) => r.id).sort()).toEqual(["b", "c"]);
  });
});

describe("interview reminder email", () => {
  it("includes interview, profile, and opt-out links", () => {
    const html = buildInterviewOpenReminderEmail({
      creatorName: "Jane Doe",
      interviewLink: "https://photobookers.com/interviews/abc",
      profileUrl: "https://photobookers.com/creators/jane-doe",
      optOutUrl:
        "https://photobookers.com/interviews/abc/opt-out-reminders",
    });

    expect(html).toContain("Jane Doe");
    expect(html).toContain("https://photobookers.com/interviews/abc");
    expect(html).toContain("https://photobookers.com/creators/jane-doe");
    expect(html).toContain("opt-out-reminders");
    expect(html).toContain("Opt out of interview reminders");
  });

  it("uses creator name in subject", () => {
    expect(interviewOpenReminderSubject("Jane Doe")).toContain("Jane Doe");
  });
});
