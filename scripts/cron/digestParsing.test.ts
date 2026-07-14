import { describe, expect, it } from "vitest";
import {
  cronKeyFromJobName,
  describeJob,
  extractEmailsSent,
  parseCronResultFromLog,
} from "./digestParsing";

// Simulate a GitHub Actions job log: each line prefixed with an ISO timestamp,
// wrapping the pretty-printed JSON that scripts/cron/run.ts writes to stdout.
function timestampedLog(lines: string[]): string {
  return lines
    .map((line) => `2026-07-14T08:01:23.4567890Z ${line}`)
    .join("\n");
}

describe("cronKeyFromJobName / describeJob", () => {
  it("takes the caller job id from a reusable-workflow job name", () => {
    expect(cronKeyFromJobName("daily-product-digest / run")).toBe(
      "daily-product-digest",
    );
    expect(cronKeyFromJobName("ceo-metrics-email")).toBe("ceo-metrics-email");
  });

  it("returns a description for known jobs and empty for unknown", () => {
    expect(describeJob("daily-product-digest / run")).toMatch(/digest/i);
    expect(describeJob("some-unknown-job / run")).toBe("");
  });
});

describe("parseCronResultFromLog", () => {
  it("extracts the ok result block from a timestamped log", () => {
    const log = timestampedLog([
      "npm warn something noisy",
      "{",
      '  "ok": true,',
      '  "job": "botd-advance-notification-emails",',
      '  "advanceEmailsSent": 3,',
      '  "items": [',
      "    {",
      '      "date": "2026-07-15"',
      "    }",
      "  ]",
      "}",
      "done",
    ]);
    const result = parseCronResultFromLog(log);
    expect(result).toMatchObject({
      ok: true,
      job: "botd-advance-notification-emails",
      advanceEmailsSent: 3,
    });
  });

  it("returns null when there is no result block", () => {
    expect(parseCronResultFromLog(timestampedLog(["no json here"]))).toBeNull();
  });

  it("ignores unrelated top-level JSON objects", () => {
    const log = timestampedLog([
      "{",
      '  "some": "other object"',
      "}",
      "{",
      '  "ok": true,',
      '  "job": "ceo-metrics-email",',
      '  "action": "sent"',
      "}",
    ]);
    expect(parseCronResultFromLog(log)).toMatchObject({
      job: "ceo-metrics-email",
    });
  });
});

describe("extractEmailsSent", () => {
  it("sums numeric *Sent counters", () => {
    expect(
      extractEmailsSent({
        ok: true,
        job: "spotlight-creator-emails",
        interviewRemindersSent: 2,
        featureDayEmailsSent: 4,
        relatedNotifySent: 1,
      }),
    ).toBe(7);
  });

  it("uses the per-recipient `sent` field", () => {
    expect(
      extractEmailsSent({ ok: true, job: "stub-outreach-emails", sent: 5 }),
    ).toBe(5);
  });

  it("counts boolean *Sent flags as one email when true", () => {
    expect(
      extractEmailsSent({
        ok: true,
        job: "instagram-prep-reminder-email",
        reminderEmailSent: true,
      }),
    ).toBe(1);
    expect(
      extractEmailsSent({
        ok: true,
        job: "instagram-prep-reminder-email",
        reminderEmailSent: false,
      }),
    ).toBe(0);
  });

  it("counts an action-only send as one, and only when actually sent", () => {
    expect(
      extractEmailsSent({ ok: true, job: "ceo-metrics-email", action: "sent" }),
    ).toBe(1);
    expect(
      extractEmailsSent({
        ok: true,
        job: "weekly-botd-newsletter-test",
        action: "test_sent",
      }),
    ).toBe(1);
    expect(
      extractEmailsSent({
        ok: true,
        job: "daily-product-digest",
        action: "skipped",
      }),
    ).toBe(0);
  });

  it("does not double-count when both `sent` and action are present", () => {
    expect(
      extractEmailsSent({
        ok: true,
        job: "interview-reminder-emails",
        action: "sent",
        sent: 3,
      }),
    ).toBe(3);
  });

  it("ignores non-email numeric fields", () => {
    expect(
      extractEmailsSent({
        ok: true,
        job: "daily-botd-instagram",
        queued: 1,
        skipped: 2,
      }),
    ).toBe(0);
  });
});
