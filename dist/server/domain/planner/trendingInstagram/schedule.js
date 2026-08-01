import { parseDateString, toUtcStartOfDay } from "../../../lib/utils.js";
import {
  getNewsletterRangeForSendWednesday,
  NEWSLETTER_SEND_WEEKDAY_UTC
} from "../../newsletters/newsletterUtils.js";
const POST_KIND_DAY_OFFSET = {
  books: 1,
  artists: 2,
  publishers: 3
};
function getCompletedNewsletterEditionRange(referenceDate = /* @__PURE__ */ new Date()) {
  const ref = toUtcStartOfDay(referenceDate);
  const daysSinceSendDay = (ref.getUTCDay() - NEWSLETTER_SEND_WEEKDAY_UTC + 7) % 7;
  const sendWednesday = new Date(ref);
  sendWednesday.setUTCDate(sendWednesday.getUTCDate() - daysSinceSendDay);
  const { weekStart, weekEnd } = getNewsletterRangeForSendWednesday(sendWednesday);
  return { weekStart, weekEnd, sendWednesday };
}
function buildTrendingInstagramDueAt(sendWednesday, kind) {
  const day = new Date(toUtcStartOfDay(sendWednesday));
  day.setUTCDate(day.getUTCDate() + POST_KIND_DAY_OFFSET[kind]);
  const time = process.env.TRENDING_INSTAGRAM_POST_TIME ?? "13:00";
  const match = time.match(/^(\d{1,2}):(\d{2})$/);
  const hour = match ? Number(match[1]) : 14;
  const minute = match ? Number(match[2]) : 0;
  return new Date(
    Date.UTC(
      day.getUTCFullYear(),
      day.getUTCMonth(),
      day.getUTCDate(),
      hour,
      minute
    )
  );
}
function isTrendingInstagramRunDay(referenceDate = /* @__PURE__ */ new Date()) {
  return toUtcStartOfDay(referenceDate).getUTCDay() === 3;
}
function parseTrendingInstagramReferenceDate(value) {
  if (!value?.trim()) return void 0;
  const date = parseDateString(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid DATE (use YYYY-MM-DD)");
  }
  return date;
}
export {
  buildTrendingInstagramDueAt,
  getCompletedNewsletterEditionRange,
  isTrendingInstagramRunDay,
  parseTrendingInstagramReferenceDate
};
