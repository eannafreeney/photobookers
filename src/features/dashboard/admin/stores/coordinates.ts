export function parseOptionalCoordinate(value: unknown): number | null {
  if (value === "" || value == null) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}
