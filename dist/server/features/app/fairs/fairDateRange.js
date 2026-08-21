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
  "Dec"
];
function formatFairDateRange(start, end) {
  const startDay = start.getUTCDate();
  const endDay = end.getUTCDate();
  const startMonth = MONTHS[start.getUTCMonth()] ?? "";
  const endMonth = MONTHS[end.getUTCMonth()] ?? "";
  const year = start.getUTCFullYear();
  if (startMonth === endMonth && start.getUTCFullYear() === end.getUTCFullYear()) {
    return {
      month: startMonth,
      days: startDay === endDay ? `${startDay}` : `${startDay}\u2013${endDay}`,
      year
    };
  }
  return {
    month: "",
    days: `${startMonth} ${startDay} \u2013 ${endMonth} ${endDay}`,
    year
  };
}
function isFairRunning(start, end, now = /* @__PURE__ */ new Date()) {
  const startOfDay = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  );
  return start.getTime() <= startOfDay && end.getTime() >= startOfDay;
}
export {
  formatFairDateRange,
  isFairRunning
};
