// Parse HTML input type="week" value (YYYY-Www) to Monday of that week UTC
export function parseWeekString(str: string): Date {
  const match = str.match(/^(\d{4})-W(0[1-9]|[1-4][0-9]|5[0-3])$/);
  if (!match) return new Date(NaN);
  const y = parseInt(match[1], 10);
  const w = parseInt(match[2], 10);
  const jan4 = new Date(Date.UTC(y, 0, 4));
  const dow = jan4.getUTCDay();
  const daysToMonday = dow === 0 ? 6 : dow - 1;
  const mondayWeek1 = new Date(Date.UTC(y, 0, 4 - daysToMonday));
  return new Date(
    Date.UTC(
      mondayWeek1.getUTCFullYear(),
      mondayWeek1.getUTCMonth(),
      mondayWeek1.getUTCDate() + (w - 1) * 7,
    ),
  );
}

/** Format a week-start Date (e.g. bookOfTheWeekEntry.weekStart) to "YYYY-Www" for display or input value */
export function toWeekString(d: Date): string {
  const mon = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
  const day = mon.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  const thursday = new Date(mon);
  thursday.setUTCDate(mon.getUTCDate() + 3 + diff);
  const year = thursday.getUTCFullYear();
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const daysToMonday = (jan4.getUTCDay() + 6) % 7;
  const firstMonday = new Date(Date.UTC(year, 0, 4 - daysToMonday));
  const weekNum =
    1 +
    Math.floor(
      (mon.getTime() - firstMonday.getTime()) / (7 * 24 * 60 * 60 * 1000),
    );
  const w = Math.max(1, Math.min(53, weekNum));
  return `${year}-W${String(w).padStart(2, "0")}`;
}
