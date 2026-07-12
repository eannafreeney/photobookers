import { parseDateString, toUtcStartOfDay } from "../../../lib/utils";
import type { TrendingInstagramPostKind } from "../../../features/dashboard/admin/planner/newsletter/types";
import {
  getNewsletterRangeForSendWednesday,
  NEWSLETTER_SEND_WEEKDAY_UTC,
} from "../newsletterUtils";

const POST_KIND_DAY_OFFSET: Record<TrendingInstagramPostKind, number> = {
  books: 1,
  artists: 2,
  publishers: 3,
};

export function getCompletedNewsletterEditionRange(
  referenceDate: Date = new Date(),
): { weekStart: Date; weekEnd: Date; sendWednesday: Date } {
  const ref = toUtcStartOfDay(referenceDate);
  const daysSinceSendDay =
    (ref.getUTCDay() - NEWSLETTER_SEND_WEEKDAY_UTC + 7) % 7;
  const sendWednesday = new Date(ref);
  sendWednesday.setUTCDate(
    sendWednesday.getUTCDate() -
      (daysSinceSendDay === 0 ? 7 : daysSinceSendDay),
  );
  const { weekStart, weekEnd } =
    getNewsletterRangeForSendWednesday(sendWednesday);
  return { weekStart, weekEnd, sendWednesday };
}

export function buildTrendingInstagramDueAt(
  sendWednesday: Date,
  kind: TrendingInstagramPostKind,
): Date {
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
      minute,
    ),
  );
}

/** Wednesday after newsletter send (UTC). Gives ~24h+ before Thu books post. */
export function isTrendingInstagramRunDay(
  referenceDate: Date = new Date(),
): boolean {
  return toUtcStartOfDay(referenceDate).getUTCDay() === 3;
}

export function parseTrendingInstagramReferenceDate(
  value?: string,
): Date | undefined {
  if (!value?.trim()) return undefined;
  const date = parseDateString(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid DATE (use YYYY-MM-DD)");
  }
  return date;
}
