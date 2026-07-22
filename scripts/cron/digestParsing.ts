/**
 * Pure helpers for the cron daily digest (scripts/cron/daily-digest.ts).
 * Extracted so the fragile log-parsing / email-counting logic is unit-testable
 * without importing the top-level script (which runs on import).
 */

// One-line summary of what each cron does, keyed by CronJobName (the caller job
// id, i.e. the part of the GitHub job name before " / "). Keep in sync with
// CRON_JOB_NAMES in src/jobs/cronRunners.ts.
export const CRON_JOB_DESCRIPTIONS: Record<string, string> = {
  "daily-botd-instagram": "Queues the Book of the Day Instagram post via Buffer.",
  "botd-advance-notification-emails":
    "Emails creators a heads-up that their book is featured soon.",
  "botd-feature-day-emails":
    "Emails creators on the day their book is Book of the Day.",
  "ceo-metrics-email": "Sends the daily CEO metrics summary email.",
  "daily-product-digest": "Sends the daily new-books product digest email.",
  "spotlight-creator-emails":
    "Emails artist/publisher of the week spotlight notifications.",
  "notify-followers-new-books":
    "Emails followers about new books from creators they follow.",
  "notify-followers-new-posts":
    "Emails followers about new posts from creators they follow.",
  "weekly-botd-newsletter": "Sends the weekly Book of the Day newsletter campaign.",
  "weekly-botd-newsletter-test":
    "Sends a test copy of the weekly newsletter before the real send.",
  "weekly-botd-newsletter-prepare":
    "Pre-creates next week's Book of the Day newsletter draft (Thu–Wed).",
  "weekly-trending-instagram":
    "Prepares and queues the weekly trending-books Instagram post.",
  "instagram-prep-reminder-email":
    "Reminds admins to prepare Instagram content for schedule gaps.",
  "planner-content-preview-email": "Emails a preview of the week's planned content.",
  "creator-analytics-digest": "Emails creators their monthly analytics digest.",
  "creator-milestone-emails":
    "Emails creators when they hit view/like milestones.",
  "stub-outreach-emails":
    "Emails unclaimed creator stubs inviting them to claim their profile.",
  "interview-reminder-emails": "Reminds creators with pending interview invites.",
  "verified-creator-instagram":
    "Queues Instagram posts celebrating newly verified creators.",
  "verification-feedback-emails":
    "Requests feedback from users after verification.",
  "creator-profile-share-emails":
    "Emails creators a shareable link to their profile.",
};

// The GitHub job name for a reusable-workflow call is "<caller-job-id> / <inner>"
// (e.g. "daily-product-digest / run"). The caller job id is the CronJobName.
export function cronKeyFromJobName(name: string): string {
  return name.split(" / ")[0].trim();
}

export function describeJob(name: string): string {
  return CRON_JOB_DESCRIPTIONS[cronKeyFromJobName(name)] ?? "";
}

// scripts/cron/run.ts prints `JSON.stringify({ ok: true, job, ...result }, null, 2)`
// on success. In Actions logs each line is prefixed with an ISO timestamp; the
// top-level object opens/closes at indent 0, so strip the prefix and collect
// bare "{"…"}" blocks, then return the first that looks like a cron result.
export function parseCronResultFromLog(
  log: string,
): Record<string, unknown> | null {
  const lines = log.split(/\r?\n/).map((line) => line.replace(/^\S+Z\s?/, ""));

  const blocks: string[] = [];
  let current: string[] | null = null;
  for (const line of lines) {
    if (line === "{") {
      current = [line];
    } else if (current) {
      current.push(line);
      if (line === "}") {
        blocks.push(current.join("\n"));
        current = null;
      }
    }
  }

  for (const block of blocks) {
    try {
      const parsed = JSON.parse(block) as Record<string, unknown>;
      if (parsed && parsed.ok === true && typeof parsed.job === "string") {
        return parsed;
      }
    } catch {
      // not the block we want
    }
  }
  return null;
}

// Sum email-count fields generically: any key ending in "sent" (numeric counters
// like advanceEmailsSent/sent, or booleans like reminderEmailSent). Jobs that
// only report `action` (single-recipient or campaign sends) count as one send.
export function extractEmailsSent(result: Record<string, unknown>): number {
  let total = 0;
  let sawSentField = false;

  for (const [key, value] of Object.entries(result)) {
    if (key === "ok" || key === "job") continue;
    if (!/sent$/i.test(key)) continue;
    if (typeof value === "number" && Number.isFinite(value)) {
      total += value;
      sawSentField = true;
    } else if (typeof value === "boolean") {
      if (value) total += 1;
      sawSentField = true;
    }
  }

  if (!sawSentField) {
    const action = typeof result.action === "string" ? result.action : "";
    if (action === "sent" || action === "test_sent") return 1;
  }

  return total;
}
