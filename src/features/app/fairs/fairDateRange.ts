const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export type FairDateRange = {
  /** Big line in the timeline gutter, e.g. "12–14" or "30 Sep – 2 Oct". */
  days: string;
  /** Month label above it, empty when the range already names both months. */
  month: string;
  year: number;
};

/** Compact date range for the fairs timeline: "Sep · 12–14", "Sep 30 – Oct 2". */
export function formatFairDateRange(start: Date, end: Date): FairDateRange {
  const startDay = start.getUTCDate();
  const endDay = end.getUTCDate();
  const startMonth = MONTHS[start.getUTCMonth()] ?? "";
  const endMonth = MONTHS[end.getUTCMonth()] ?? "";
  const year = start.getUTCFullYear();

  if (startMonth === endMonth && start.getUTCFullYear() === end.getUTCFullYear()) {
    return {
      month: startMonth,
      days: startDay === endDay ? `${startDay}` : `${startDay}–${endDay}`,
      year,
    };
  }

  return {
    month: "",
    days: `${startMonth} ${startDay} – ${endMonth} ${endDay}`,
    year,
  };
}

/** True while the fair is running (inclusive of both end days). */
export function isFairRunning(
  start: Date,
  end: Date,
  now: Date = new Date(),
): boolean {
  const startOfDay = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  return start.getTime() <= startOfDay && end.getTime() >= startOfDay;
}
