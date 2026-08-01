const REMINDER_INTERVAL_DAYS = 14;
function addUtcDays(date, days) {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}
function toUtcStartOfDay(date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
}
function reminderAnchorDate(row) {
  return row.reminderSentAt ?? row.invitedAt;
}
function isDueForInterviewReminder(row, runDate, intervalDays = REMINDER_INTERVAL_DAYS, force = false) {
  if (force) return true;
  const cutoff = addUtcDays(toUtcStartOfDay(runDate), -intervalDays);
  return reminderAnchorDate(row) <= cutoff;
}
function pickInterviewsForReminder(rows) {
  const byCreator = /* @__PURE__ */ new Map();
  for (const row of rows) {
    const existing = byCreator.get(row.creatorId);
    if (!existing || row.invitedAt > existing.invitedAt) {
      byCreator.set(row.creatorId, row);
    }
  }
  return [...byCreator.values()];
}
export {
  REMINDER_INTERVAL_DAYS,
  isDueForInterviewReminder,
  pickInterviewsForReminder,
  reminderAnchorDate
};
