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

/** Format a week-start Date to "YYYY-Www" for display or input value */
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

/** Parse "YYYY-MM-DD" to a UTC-midnight Date. Returns Invalid Date on bad input. */
export function parseDateString(str: string): Date {
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return new Date(NaN);
  const y = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const d = parseInt(match[3], 10);
  const date = new Date(Date.UTC(y, m - 1, d));
  if (
    date.getUTCFullYear() !== y ||
    date.getUTCMonth() !== m - 1 ||
    date.getUTCDate() !== d
  ) {
    return new Date(NaN);
  }
  return date;
}

/** Format a Date as "YYYY-MM-DD" using UTC components. */
export function toDateString(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Format a Date as "YYYY-MM-DD" using local calendar components. */
export function toLocalDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Normalize Postgres DATE / timestamp date-mode values to UTC midnight. */
export function normalizeStoredDate(d: Date): Date {
  return parseDateString(toLocalDateString(d));
}

/** Normalize any Date to UTC midnight (00:00:00.000) of the same Y/M/D. */
export function toUtcStartOfDay(d: Date): Date {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
}

/** Normalize any Date to the Monday (UTC) of its ISO week. */
export function toWeekStart(d: Date): Date {
  const date = toUtcStartOfDay(d);
  const day = date.getUTCDay();
  const daysToMonday = day === 0 ? 6 : day - 1;
  date.setUTCDate(date.getUTCDate() - daysToMonday);
  return date;
}

export function truncate(str: string, maxLength: number): string {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength).trim() + "…";
}

export const formatCountry = (country: string) => {
  if (country === "United States of America") {
    return "USA";
  }
  if (country === "United Kingdom") {
    return "UK";
  }
  return country;
};

/** e.g. "London, UK" — matches creator card / profile location display. */
export const formatCreatorLocation = (
  city: string | null | undefined,
  country: string | null | undefined,
): string | null => {
  const cityTrim = city?.trim();
  const countryTrim = country?.trim();
  if (cityTrim && countryTrim) {
    return `${cityTrim}, ${formatCountry(countryTrim)}`;
  }
  if (cityTrim) return cityTrim;
  if (countryTrim) return formatCountry(countryTrim);
  return null;
};
