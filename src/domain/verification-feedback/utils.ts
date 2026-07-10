import { toUtcStartOfDay } from "../../lib/utils";

export const VERIFICATION_FEEDBACK_DELAY_DAYS = 7;

function addUtcDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

export function getVerificationFeedbackEligibleBefore(
  runDate: Date = new Date(),
): Date {
  return addUtcDays(
    toUtcStartOfDay(runDate),
    -VERIFICATION_FEEDBACK_DELAY_DAYS,
  );
}
