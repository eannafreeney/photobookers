import { sendAdminEmail } from "../../../lib/sendEmail.js";
import { err, ok } from "../../../lib/result.js";
import { toDateString, toWeekString } from "../../../lib/utils.js";
import { buildInstagramPrepReminderEmail } from "../../../features/dashboard/admin/planner/emails.js";
import { getWeekInstagramForPrepare } from "../../../features/dashboard/admin/planner/instagramServices.js";
import {
  getWeekInstagramPrepGaps
} from "../../../features/dashboard/admin/planner/instagramUtils.js";
import { getInstagramPrepReminderWeekStart } from "../../../features/dashboard/admin/planner/utils.js";
function getInstagramPrepReminderWeekStartForDate(asOf = /* @__PURE__ */ new Date()) {
  return getInstagramPrepReminderWeekStart(asOf);
}
async function runInstagramPrepReminderEmail(asOf = /* @__PURE__ */ new Date()) {
  const weekStart = getInstagramPrepReminderWeekStart(asOf);
  if (!weekStart) {
    return ok({
      reminderEmailSent: false,
      weekStart: null,
      gaps: [],
      outcome: { status: "skipped", reason: "not_reminder_day" }
    });
  }
  const [loadError, weekData] = await getWeekInstagramForPrepare(weekStart);
  if (loadError) return err(loadError);
  const botdByDate = new Map(
    weekData.botdEntries.map((entry) => [toDateString(entry.date), entry])
  );
  const gaps = getWeekInstagramPrepGaps(weekStart, botdByDate, {
    artistOfTheWeek: weekData.artistOfTheWeek,
    publisherOfTheWeek: weekData.publisherOfTheWeek
  });
  if (gaps.length === 0) {
    const hasScheduledContent = weekData.botdEntries.length > 0 || Boolean(weekData.artistOfTheWeek) || Boolean(weekData.publisherOfTheWeek);
    return ok({
      reminderEmailSent: false,
      weekStart,
      gaps: [],
      outcome: {
        status: "skipped",
        reason: hasScheduledContent ? "fully_prepared" : "nothing_scheduled"
      }
    });
  }
  const siteUrl = process.env.SITE_URL ?? "https://photobookers.com";
  const weekKey = toWeekString(weekStart);
  const prepareUrl = `${siteUrl}/dashboard/admin/planner/instagram/${weekKey}/prepare`;
  const subject = `Instagram posts not prepared for week ${weekKey}`;
  const html = buildInstagramPrepReminderEmail({
    weekStart,
    gaps,
    prepareUrl
  });
  const [emailError] = await sendAdminEmail(subject, html);
  if (emailError) {
    return ok({
      reminderEmailSent: false,
      weekStart,
      gaps,
      outcome: { status: "failed", reason: emailError.reason }
    });
  }
  return ok({
    reminderEmailSent: true,
    weekStart,
    gaps,
    outcome: { status: "sent" }
  });
}
export {
  getInstagramPrepReminderWeekStartForDate,
  runInstagramPrepReminderEmail
};
