import { sendAdminEmail } from "../../lib/sendEmail";
import { err, ok, type Result } from "../../lib/result";
import { formatAnalyticsDateRangeLabel } from "../../features/book-analytics/dateRange";
import { buildNewsletterGrowthEmail, newsletterGrowthEmailSubject } from "./emails";
import { getNewsletterGrowthReport } from "./services";

type ServiceError = { reason: string; cause?: unknown };

export type NewsletterGrowthCronResult = {
  action: "sent" | "dry_run";
  rangeLabel?: string;
  totalSubscribers?: number;
  signupsThisWeek?: number;
  editorialBuyClicks?: number;
};

export type NewsletterGrowthCronOptions = {
  dryRun?: boolean;
  date?: Date;
};

export async function runNewsletterGrowthDigestCron(
  options: NewsletterGrowthCronOptions = {},
): Promise<Result<NewsletterGrowthCronResult, ServiceError>> {
  const asOf = options.date ?? new Date();
  const [reportError, report] = await getNewsletterGrowthReport(asOf);
  if (reportError) return err(reportError);

  const rangeLabel = formatAnalyticsDateRangeLabel(report.range);
  const subject = newsletterGrowthEmailSubject(report);
  const html = buildNewsletterGrowthEmail(report);

  if (options.dryRun) {
    return ok({
      action: "dry_run",
      rangeLabel,
      totalSubscribers: report.totalSubscribers,
      signupsThisWeek: report.signupsThisWeek,
      editorialBuyClicks: report.editorialBuyClicks,
    });
  }

  const [emailError] = await sendAdminEmail(subject, html);
  if (emailError) {
    return err({ reason: emailError.reason, cause: emailError.cause });
  }

  return ok({
    action: "sent",
    rangeLabel,
    totalSubscribers: report.totalSubscribers,
    signupsThisWeek: report.signupsThisWeek,
    editorialBuyClicks: report.editorialBuyClicks,
  });
}
