import {
  parseWeekString,
  toUtcStartOfDay,
  toWeekStart,
  toWeekString
} from "../../../../lib/utils.js";
function getWeekStarts(year) {
  const firstMonday = parseWeekString(`${year}-W01`);
  const weekStarts = [];
  const msPerWeek = 7 * 24 * 60 * 60 * 1e3;
  for (let k = 0; k < 53; k++) {
    const d = new Date(firstMonday.getTime() + k * msPerWeek);
    if (toWeekString(d).startsWith(`${year}-`)) {
      weekStarts.push(d);
    }
  }
  return weekStarts;
}
function getWeekDays(weekStart) {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setUTCDate(d.getUTCDate() + i);
    days.push(d);
  }
  return days;
}
function formatDayLabel(d) {
  const weekday = d.toLocaleString("en-US", {
    weekday: "short",
    timeZone: "UTC"
  });
  const month = d.toLocaleString("en-US", {
    month: "short",
    timeZone: "UTC"
  });
  return `${weekday} ${month} ${d.getUTCDate()}`;
}
function formatDayWeekday(d) {
  return d.toLocaleString("en-US", { weekday: "short", timeZone: "UTC" });
}
function formatBotdDateLong(d) {
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC"
  });
}
function isDayInPast(date) {
  const today = toUtcStartOfDay(/* @__PURE__ */ new Date());
  return toUtcStartOfDay(date).getTime() < today.getTime();
}
function formatWeekRange(weekStart) {
  const start = new Date(weekStart);
  const end = new Date(weekStart);
  end.setUTCDate(end.getUTCDate() + 6);
  const monthStart = start.toLocaleString("en-US", { month: "short" });
  const monthEnd = end.toLocaleString("en-US", { month: "short" });
  const dayStart = start.getUTCDate();
  const dayEnd = end.getUTCDate();
  const year = end.getUTCFullYear();
  if (monthStart === monthEnd) {
    return `${monthStart} ${dayStart}\u2013${dayEnd}, ${year}`;
  }
  return `${monthStart} ${dayStart} \u2013 ${monthEnd} ${dayEnd}, ${year}`;
}
function getWeekNumber(weekStart) {
  const d = new Date(weekStart);
  d.setUTCDate(d.getUTCDate() + 3);
  const jan1 = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return 1 + Math.ceil(
    (d.getTime() - jan1.getTime()) / (7 * 24 * 60 * 60 * 1e3) - (jan1.getUTCDay() + 6) % 7 / 7
  );
}
function isWeekInPast(weekStart) {
  const now = /* @__PURE__ */ new Date();
  const today = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
  const day = today.getUTCDay();
  const daysToMonday = day === 0 ? 6 : day - 1;
  today.setUTCDate(today.getUTCDate() - daysToMonday);
  return weekStart.getTime() < today.getTime();
}
function addUtcDays(date, days) {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}
function getBotdAdvanceEmailScheduledDate(featureDate) {
  return addUtcDays(toUtcStartOfDay(featureDate), -7);
}
function getBotdFeatureDayEmailScheduledDate(featureDate) {
  return toUtcStartOfDay(featureDate);
}
function getSpotlightAdvanceEmailScheduledDate(weekStart) {
  return addUtcDays(toWeekStart(weekStart), -7);
}
function getSpotlightFeatureDayEmailScheduledDate(weekStart) {
  return toWeekStart(weekStart);
}
function getInstagramPrepReminderScheduledDate(weekStart) {
  return addUtcDays(toWeekStart(weekStart), -2);
}
function getInstagramPrepReminderWeekStart(asOf) {
  const today = toUtcStartOfDay(asOf);
  const weekStart = addUtcDays(today, 2);
  if (weekStart.getUTCDay() !== 1) return null;
  return toWeekStart(weekStart);
}
function getEmailSendStatus(params) {
  if (params.sentAt) return "sent";
  if (!params.hasEmail) return "blocked";
  const today = toUtcStartOfDay(params.now ?? /* @__PURE__ */ new Date());
  const scheduled = toUtcStartOfDay(params.scheduledDate);
  if (scheduled.getTime() < today.getTime()) return "overdue";
  if (scheduled.getTime() === today.getTime()) return "today";
  return "pending";
}
export {
  addUtcDays,
  formatBotdDateLong,
  formatDayLabel,
  formatDayWeekday,
  formatWeekRange,
  getBotdAdvanceEmailScheduledDate,
  getBotdFeatureDayEmailScheduledDate,
  getEmailSendStatus,
  getInstagramPrepReminderScheduledDate,
  getInstagramPrepReminderWeekStart,
  getSpotlightAdvanceEmailScheduledDate,
  getSpotlightFeatureDayEmailScheduledDate,
  getWeekDays,
  getWeekNumber,
  getWeekStarts,
  isDayInPast,
  isWeekInPast
};
