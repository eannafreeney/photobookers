import {
  formatAnalyticsDateRangeLabel,
  yesterdayAnalyticsDateRange,
} from "../../features/book-analytics/dateRange";
import { sendAdminEmail } from "../../lib/sendEmail";
import { err, ok, type Result } from "../../lib/result";
import {
  buildDailyProductDigestEmail,
  dailyProductDigestEmailSubject,
} from "./emails";
import { getDailyProductDigestSnapshot } from "./services";

type ServiceError = { reason: string; cause?: unknown };

export type DailyProductDigestCronResult = {
  action: "sent" | "dry_run";
  rangeLabel?: string;
  growth?: {
    newUsers: number;
    verifiedCreators: number;
    newBooks: number;
    newFavorites: number;
    newsletterSignups: number | null;
    outboundClicks: number;
  };
};

export type DailyProductDigestCronOptions = {
  dryRun?: boolean;
  to?: string;
  date?: Date;
};

export async function runDailyProductDigestCron(
  options: DailyProductDigestCronOptions = {},
): Promise<Result<DailyProductDigestCronResult, ServiceError>> {
  const runDate = options.date ?? new Date();
  const range = yesterdayAnalyticsDateRange(runDate);

  const [metricsError, snapshot] = await getDailyProductDigestSnapshot(runDate);
  if (metricsError) return err(metricsError);

  const rangeLabel = formatAnalyticsDateRangeLabel(range);
  const subject = dailyProductDigestEmailSubject(rangeLabel);
  const html = buildDailyProductDigestEmail(snapshot);

  if (options.dryRun) {
    return ok({
      action: "dry_run",
      rangeLabel,
      growth: snapshot.growth,
    });
  }

  const [emailError] = await sendAdminEmail(subject, html);
  if (emailError) {
    return err({ reason: emailError.reason, cause: emailError.cause });
  }

  return ok({
    action: "sent",
    rangeLabel,
    growth: snapshot.growth,
  });
}
