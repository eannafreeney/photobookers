import {
  formatAnalyticsDateRangeLabel,
  yesterdayAnalyticsDateRange
} from "../../features/book-analytics/dateRange.js";
import { sendAdminEmail } from "../../lib/sendEmail.js";
import { err, ok } from "../../lib/result.js";
import {
  buildDailyProductDigestEmail,
  dailyProductDigestEmailSubject
} from "./emails.js";
import { getDailyProductDigestSnapshot } from "./services.js";
async function runDailyProductDigestCron(options = {}) {
  const runDate = options.date ?? /* @__PURE__ */ new Date();
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
      growth: snapshot.growth
    });
  }
  const [emailError] = await sendAdminEmail(subject, html);
  if (emailError) {
    return err({ reason: emailError.reason, cause: emailError.cause });
  }
  return ok({
    action: "sent",
    rangeLabel,
    growth: snapshot.growth
  });
}
export {
  runDailyProductDigestCron
};
