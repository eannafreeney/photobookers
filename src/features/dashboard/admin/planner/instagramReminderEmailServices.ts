import { sendAdminEmail } from "../../../../lib/sendEmail";
import { err, ok, type Result } from "../../../../lib/result";
import { toDateString, toWeekString } from "../../../../lib/utils";
import { buildInstagramPrepReminderEmail } from "./emails";
import { getWeekInstagramForPrepare } from "./instagramServices";
import {
  getWeekInstagramPrepGaps,
  type InstagramPrepGap,
} from "./instagramUtils";
import { getInstagramPrepReminderWeekStart } from "./utils";

type InstagramReminderServiceError = { reason: string; cause?: unknown };

export type InstagramPrepReminderSkipReason =
  | "not_reminder_day"
  | "fully_prepared"
  | "nothing_scheduled";

export type InstagramPrepReminderOutcome =
  | { status: "skipped"; reason: InstagramPrepReminderSkipReason }
  | { status: "sent" }
  | { status: "failed"; reason: string };

export type InstagramPrepReminderRunResult = {
  reminderEmailSent: boolean;
  weekStart: Date | null;
  gaps: InstagramPrepGap[];
  outcome: InstagramPrepReminderOutcome;
};

export type RunInstagramPrepReminderEmailResult = Result<
  InstagramPrepReminderRunResult,
  InstagramReminderServiceError
>;

export function getInstagramPrepReminderWeekStartForDate(
  asOf: Date = new Date(),
): Date | null {
  return getInstagramPrepReminderWeekStart(asOf);
}

export async function runInstagramPrepReminderEmail(
  asOf: Date = new Date(),
): Promise<RunInstagramPrepReminderEmailResult> {
  const weekStart = getInstagramPrepReminderWeekStart(asOf);
  if (!weekStart) {
    return ok({
      reminderEmailSent: false,
      weekStart: null,
      gaps: [],
      outcome: { status: "skipped", reason: "not_reminder_day" },
    });
  }

  const [loadError, weekData] = await getWeekInstagramForPrepare(weekStart);
  if (loadError) return err(loadError);

  const botdByDate = new Map(
    weekData.botdEntries.map((entry) => [toDateString(entry.date), entry]),
  );
  const gaps = getWeekInstagramPrepGaps(weekStart, botdByDate, {
    artistOfTheWeek: weekData.artistOfTheWeek,
    publisherOfTheWeek: weekData.publisherOfTheWeek,
  });

  if (gaps.length === 0) {
    const hasScheduledContent =
      weekData.botdEntries.length > 0 ||
      Boolean(weekData.artistOfTheWeek) ||
      Boolean(weekData.publisherOfTheWeek);

    return ok({
      reminderEmailSent: false,
      weekStart,
      gaps: [],
      outcome: {
        status: "skipped",
        reason: hasScheduledContent ? "fully_prepared" : "nothing_scheduled",
      },
    });
  }

  const siteUrl = process.env.SITE_URL ?? "https://photobookers.com";
  const weekKey = toWeekString(weekStart);
  const prepareUrl = `${siteUrl}/dashboard/admin/planner/instagram/${weekKey}/prepare`;
  const subject = `Instagram posts not prepared for week ${weekKey}`;
  const html = buildInstagramPrepReminderEmail({
    weekStart,
    gaps,
    prepareUrl,
  });

  const [emailError] = await sendAdminEmail(subject, html);
  if (emailError) {
    return ok({
      reminderEmailSent: false,
      weekStart,
      gaps,
      outcome: { status: "failed", reason: emailError.reason },
    });
  }

  return ok({
    reminderEmailSent: true,
    weekStart,
    gaps,
    outcome: { status: "sent" },
  });
}
