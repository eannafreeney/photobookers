import { formatAnalyticsDateRangeLabel } from "../../features/book-analytics/dateRange.js";
import { sendAdminEmail } from "../../lib/sendEmail.js";
import { err, ok } from "../../lib/result.js";
import { buildCeoMetricsEmail, ceoMetricsEmailSubject } from "./emails.js";
import { isMondayUtc } from "./format.js";
import { getCeoMetricsSnapshot } from "./services.js";
async function runCeoMetricsEmailCron(options = {}) {
  const runDate = options.date ?? /* @__PURE__ */ new Date();
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
        newReleases: snapshot.supplyHealth.newReleases.value
      }
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
      newReleases: snapshot.supplyHealth.newReleases.value
    }
  });
}
export {
  runCeoMetricsEmailCron
};
