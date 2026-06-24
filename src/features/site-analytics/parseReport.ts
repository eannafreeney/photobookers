import type { google } from "@google-analytics/data/build/protos/protos";

type Row = google.analytics.data.v1beta.IRow;
type Report = google.analytics.data.v1beta.IRunReportResponse;

export function metricValue(
  row: Row | null | undefined,
  index: number,
): number {
  const value = row?.metricValues?.[index]?.value;
  if (!value) return 0;
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

export function dimensionValue(
  row: Row | null | undefined,
  index: number,
): string {
  return row?.dimensionValues?.[index]?.value ?? "";
}

export function reportRows(report: Report | null | undefined): Row[] {
  return (report?.rows ?? []).filter(Boolean) as Row[];
}
