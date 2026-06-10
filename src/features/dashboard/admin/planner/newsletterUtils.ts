import { formatOrdinalDate, toWeekStart } from "../../../../lib/utils";

export function getPreviousWeekRange(referenceDate: Date = new Date()) {
  const currentWeekStart = toWeekStart(referenceDate);
  const previousWeekStart = new Date(currentWeekStart);
  previousWeekStart.setUTCDate(previousWeekStart.getUTCDate() - 7);
  const previousWeekEnd = new Date(previousWeekStart);
  previousWeekEnd.setUTCDate(previousWeekEnd.getUTCDate() + 6);
  return { weekStart: previousWeekStart, weekEnd: previousWeekEnd };
}

export function formatWeekRangeLabel(weekStart: Date, weekEnd: Date): string {
  return `${formatOrdinalDate(weekStart)} to ${formatOrdinalDate(weekEnd)}`;
}
