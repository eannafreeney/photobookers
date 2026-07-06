function formatEngagementRate(rate) {
  if (rate === null) return "\u2014";
  return `${(rate * 100).toFixed(1)}%`;
}
function formatDuration(seconds) {
  if (!seconds) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}
function formatGaDate(yyyymmdd) {
  if (yyyymmdd.length === 8) {
    return `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`;
  }
  return yyyymmdd;
}
export {
  formatDuration,
  formatEngagementRate,
  formatGaDate
};
