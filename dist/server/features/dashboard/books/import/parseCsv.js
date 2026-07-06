import { parse } from "csv/sync";
import { MAX_IMPORT_ROWS } from "./constants.js";
const HEADER_ALIASES = {
  title: "title",
  description: "description",
  release_date: "release_date",
  releasedate: "release_date",
  release: "release_date",
  tags: "tags",
  purchase_link: "purchase_link",
  purchaselink: "purchase_link",
  purchase: "purchase_link",
  availability_status: "availability_status",
  availability: "availability_status",
  status: "availability_status",
  artist: "artist",
  publisher: "publisher"
};
function normalizeHeader(header) {
  const key = header.trim().toLowerCase().replace(/[\s-]+/g, "_");
  return HEADER_ALIASES[key] ?? null;
}
function normalizeAvailability(value) {
  const normalized = (value ?? "").trim().toLowerCase().replace(/\s+/g, "_");
  if (normalized === "sold_out" || normalized === "soldout" || normalized === "sold out") {
    return "sold_out";
  }
  if (normalized === "unavailable" || normalized === "not_available") {
    return "unavailable";
  }
  return "available";
}
function sanitizeCsvValue(value) {
  const trimmed = value.trim();
  if (trimmed.match(/^[=+@-]/)) {
    return `'${trimmed}`;
  }
  return trimmed;
}
function rowFromRecord(record, rowNumber) {
  const mapped = {};
  for (const [rawKey, rawValue] of Object.entries(record)) {
    const field = normalizeHeader(rawKey);
    if (!field) continue;
    const value = rawValue?.trim() ?? "";
    if (!value) continue;
    const sanitized = sanitizeCsvValue(value);
    if (field === "availability_status") {
      mapped.availability_status = normalizeAvailability(sanitized);
    } else {
      mapped[field] = sanitized;
    }
  }
  return { row: mapped, rowNumber };
}
function parseCsvContent(content) {
  const trimmed = content.trim();
  if (!trimmed) {
    return { ok: false, error: "CSV file is empty" };
  }
  const firstLine = trimmed.split("\n")[0] ?? "";
  const delimiter = firstLine.includes(";") ? ";" : ",";
  let records;
  try {
    records = parse(trimmed, {
      delimiter,
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
  } catch {
    return {
      ok: false,
      error: "Could not parse CSV file. Check the format and try again."
    };
  }
  if (records.length === 0) {
    return { ok: false, error: "CSV file has no data rows" };
  }
  if (records.length > MAX_IMPORT_ROWS) {
    return {
      ok: false,
      error: `CSV has ${records.length} rows. Maximum is ${MAX_IMPORT_ROWS} per import.`
    };
  }
  const rows = records.map((record, index) => rowFromRecord(record, index + 2));
  return { ok: true, rows };
}
export {
  parseCsvContent
};
