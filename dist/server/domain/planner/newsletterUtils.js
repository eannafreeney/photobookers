import {
  formatOrdinalDate,
  toUtcStartOfDay
} from "../../lib/utils.js";
const NEWSLETTER_SEND_WEEKDAY_UTC = 3;
function getNewsletterRangeForSendWednesday(sendWednesday) {
  const weekEnd = toUtcStartOfDay(sendWednesday);
  const weekStart = new Date(weekEnd);
  weekStart.setUTCDate(weekStart.getUTCDate() - 6);
  return { weekStart, weekEnd };
}
function getDaysUntilNewsletterSend(referenceDate = /* @__PURE__ */ new Date()) {
  const day = toUtcStartOfDay(referenceDate).getUTCDay();
  if (day === NEWSLETTER_SEND_WEEKDAY_UTC) return 0;
  return (NEWSLETTER_SEND_WEEKDAY_UTC - day + 7) % 7;
}
function getCurrentNewsletterRange(referenceDate = /* @__PURE__ */ new Date()) {
  const ref = toUtcStartOfDay(referenceDate);
  const sendWednesday = new Date(ref);
  sendWednesday.setUTCDate(
    sendWednesday.getUTCDate() + getDaysUntilNewsletterSend(ref)
  );
  return getNewsletterRangeForSendWednesday(sendWednesday);
}
function getNewsletterRangeStartForPlannerWeek(plannerMonday) {
  const monday = toUtcStartOfDay(plannerMonday);
  const sendWednesday = new Date(monday);
  sendWednesday.setUTCDate(sendWednesday.getUTCDate() + 2);
  return getNewsletterRangeForSendWednesday(sendWednesday).weekStart;
}
function isNewsletterSendDay(referenceDate = /* @__PURE__ */ new Date()) {
  return toUtcStartOfDay(referenceDate).getUTCDay() === NEWSLETTER_SEND_WEEKDAY_UTC;
}
function resolveNewsletterRangeStart(date) {
  const d = toUtcStartOfDay(date);
  const day = d.getUTCDay();
  if (day === 4) return d;
  if (day === 1) return getNewsletterRangeStartForPlannerWeek(d);
  const daysSinceThursday = (day - 4 + 7) % 7;
  const thursday = new Date(d);
  thursday.setUTCDate(thursday.getUTCDate() - daysSinceThursday);
  return thursday;
}
const newsletterWeekdayLabel = (date) => date.toLocaleDateString("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  timeZone: "UTC"
});
function formatNewsletterWeekRange(weekStart, weekEnd) {
  return `${newsletterWeekdayLabel(weekStart)} \u2013 ${newsletterWeekdayLabel(weekEnd)}`;
}
function formatWeekRangeLabel(weekStart, weekEnd) {
  return `${formatOrdinalDate(weekStart)} to ${formatOrdinalDate(weekEnd)}`;
}
export {
  NEWSLETTER_SEND_WEEKDAY_UTC,
  formatNewsletterWeekRange,
  formatWeekRangeLabel,
  getCurrentNewsletterRange,
  getDaysUntilNewsletterSend,
  getNewsletterRangeForSendWednesday,
  getNewsletterRangeStartForPlannerWeek,
  isNewsletterSendDay,
  resolveNewsletterRangeStart
};
