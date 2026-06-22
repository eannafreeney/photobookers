// CSV Import Limits
export const MAX_IMPORT_ROWS = 100;
export const MAX_IMPORT_FILE_BYTES = 1 * 1024 * 1024;

// Image Upload Limits
export const MAX_IMAGES_PER_BOOK = 10;
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB per image
export const MAX_TOTAL_UPLOAD_SIZE_BYTES = 100 * 1024 * 1024; // 100MB total per request

// Rate Limiting
export const MAX_IMPORTS_PER_HOUR = 5;
export const MAX_BOOKS_CREATED_PER_DAY = 500;
export const MAX_IMAGE_UPLOADS_PER_HOUR = 10;

// Bulk Operations
export const MAX_BOOKS_FOR_BULK_UPLOAD = 100;

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
