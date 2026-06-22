export const MAX_IMPORT_ROWS = 100;
export const MAX_IMPORT_FILE_BYTES = 1 * 1024 * 1024;

export const BASE_CSV_HEADERS = [
  "title",
  "description",
  "release_date",
  "tags",
  "purchase_link",
  "availability_status",
] as const;

export type BaseCsvHeader = (typeof BASE_CSV_HEADERS)[number];
export type CsvHeader = BaseCsvHeader | "artist" | "publisher";

export function getCsvHeadersForCreatorType(
  creatorType: "artist" | "publisher",
): readonly CsvHeader[] {
  if (creatorType === "publisher") {
    return [...BASE_CSV_HEADERS, "artist"];
  }
  return [...BASE_CSV_HEADERS, "publisher"];
}
