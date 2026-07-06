function metricValue(row, index) {
  const value = row?.metricValues?.[index]?.value;
  if (!value) return 0;
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}
function dimensionValue(row, index) {
  return row?.dimensionValues?.[index]?.value ?? "";
}
function reportRows(report) {
  return (report?.rows ?? []).filter(Boolean);
}
export {
  dimensionValue,
  metricValue,
  reportRows
};
