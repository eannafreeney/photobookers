function parseOptionalCoordinate(value) {
  if (value === "" || value == null) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}
export {
  parseOptionalCoordinate
};
