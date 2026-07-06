function parseWeekString(str) {
  const match = str.match(/^(\d{4})-W(0[1-9]|[1-4][0-9]|5[0-3])$/);
  if (!match) return /* @__PURE__ */ new Date(NaN);
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
      mondayWeek1.getUTCDate() + (w - 1) * 7
    )
  );
}
function toWeekString(d) {
  const mon = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  );
  const day = mon.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  const thursday = new Date(mon);
  thursday.setUTCDate(mon.getUTCDate() + 3 + diff);
  const year = thursday.getUTCFullYear();
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const daysToMonday = (jan4.getUTCDay() + 6) % 7;
  const firstMonday = new Date(Date.UTC(year, 0, 4 - daysToMonday));
  const weekNum = 1 + Math.floor(
    (mon.getTime() - firstMonday.getTime()) / (7 * 24 * 60 * 60 * 1e3)
  );
  const w = Math.max(1, Math.min(53, weekNum));
  return `${year}-W${String(w).padStart(2, "0")}`;
}
function parseDateString(str) {
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return /* @__PURE__ */ new Date(NaN);
  const y = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const d = parseInt(match[3], 10);
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) {
    return /* @__PURE__ */ new Date(NaN);
  }
  return date;
}
function ordinalSuffix(day) {
  const mod100 = day % 100;
  if (mod100 >= 11 && mod100 <= 13) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}
function formatOrdinalDate(d) {
  const date = toUtcStartOfDay(d);
  const day = date.getUTCDate();
  const month = date.toLocaleString("en-GB", {
    month: "long",
    timeZone: "UTC"
  });
  return `${day}${ordinalSuffix(day)} ${month} ${date.getUTCFullYear()}`;
}
function toDateString(d) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function toLocalDateString(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function normalizeStoredDate(d) {
  return parseDateString(toLocalDateString(d));
}
function toUtcStartOfDay(d) {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  );
}
function capEndOfDayToToday(end) {
  const endDay = toUtcStartOfDay(end);
  const today = toUtcStartOfDay(/* @__PURE__ */ new Date());
  return endDay > today ? today : endDay;
}
function toWeekStart(d) {
  const date = toUtcStartOfDay(d);
  const day = date.getUTCDay();
  const daysToMonday = day === 0 ? 6 : day - 1;
  date.setUTCDate(date.getUTCDate() - daysToMonday);
  return date;
}
function truncate(str, maxLength) {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength).trim() + "\u2026";
}
const formatCountry = (country) => {
  if (country === "United States of America") {
    return "USA";
  }
  if (country === "United Kingdom") {
    return "UK";
  }
  return country;
};
const formatCreatorLocation = (city, country) => {
  const cityTrim = city?.trim();
  const countryTrim = country?.trim();
  if (cityTrim && countryTrim) {
    return `${cityTrim}, ${formatCountry(countryTrim)}`;
  }
  if (cityTrim) return cityTrim;
  if (countryTrim) return formatCountry(countryTrim);
  return null;
};
export {
  capEndOfDayToToday,
  formatCountry,
  formatCreatorLocation,
  formatOrdinalDate,
  normalizeStoredDate,
  parseDateString,
  parseWeekString,
  toDateString,
  toLocalDateString,
  toUtcStartOfDay,
  toWeekStart,
  toWeekString,
  truncate
};
