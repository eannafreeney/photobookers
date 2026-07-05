import { formatAnalyticsDateRangeLabel } from "../../features/book-analytics/dateRange";
import { sendAdminEmail } from "../../lib/sendEmail";
import { err, ok, type Result } from "../../lib/result";
import { buildCeoMetricsEmail, ceoMetricsEmailSubject } from "./emails";
import { isMondayUtc } from "./format";
import { getCeoMetricsSnapshot } from "./services";

type ServiceError = { reason: string; cause?: unknown };

export type CeoMetricsCronResult = {
  action: "sent" | "dry_run" | "skipped";
  reason?: "not_monday";
  rangeLabel?: string;
  metrics?: {
    weeklyActiveCollectors: number;
    editorialActions: number;
    discoverableBooks: number;
    activeCreators: number;
    newReleases: number;
  };
};

export type CeoMetricsCronOptions = {
  dryRun?: boolean;
  force?: boolean;
  to?: string;
  date?: Date;
};

export async function runCeoMetricsEmailCron(
  options: CeoMetricsCronOptions = {},
): Promise<Result<CeoMetricsCronResult, ServiceError>> {
  const runDate = options.date ?? new Date();

  if (!options.force && !isMondayUtc(runDate)) {
    return ok({ action: "skipped", reason: "not_monday" });
  }

  const [metricsError, snapshot] = await getCeoMetricsSnapshot(null);
  if (metricsError) return err(metricsError);

  const rangeLabel = formatAnalyticsDateRangeLabel(snapshot.range);
  const subject = ceoMetricsEmailSubject(rangeLabel);
  const html = buildCeoMetricsEmail(snapshot);

  if (options.dryRun) {
    return ok({
      action: "dry_run",
      rangeLabel,
      metrics: {
        weeklyActiveCollectors: snapshot.weeklyActiveCollectors.value,
        editorialActions: snapshot.editorialActions.value,
        discoverableBooks: snapshot.supplyHealth.discoverableBooks,
        activeCreators: snapshot.supplyHealth.activeCreators,
        newReleases: snapshot.supplyHealth.newReleases.value,
      },
    });
  }

  const [emailError] = await sendAdminEmail(subject, html);
  if (emailError) {
    return err({ reason: emailError.reason, cause: emailError.cause });
  }

  return ok({
    action: "sent",
    rangeLabel,
    metrics: {
      weeklyActiveCollectors: snapshot.weeklyActiveCollectors.value,
      editorialActions: snapshot.editorialActions.value,
      discoverableBooks: snapshot.supplyHealth.discoverableBooks,
      activeCreators: snapshot.supplyHealth.activeCreators,
      newReleases: snapshot.supplyHealth.newReleases.value,
    },
  });
}
