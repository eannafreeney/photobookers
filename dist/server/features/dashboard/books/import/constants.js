const MAX_IMPORT_ROWS = 100;
const MAX_IMPORT_FILE_BYTES = 1 * 1024 * 1024;
const MAX_IMAGES_PER_BOOK = 10;
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_TOTAL_UPLOAD_SIZE_BYTES = 100 * 1024 * 1024;
const MAX_IMPORTS_PER_HOUR = 5;
const MAX_BOOKS_CREATED_PER_DAY = 500;
const MAX_IMAGE_UPLOADS_PER_HOUR = 10;
const MAX_BOOKS_FOR_BULK_UPLOAD = 100;
const BASE_CSV_HEADERS = [
  "title",
  "description",
  "release_date",
  "tags",
  "purchase_link",
  "availability_status"
];
function getCsvHeadersForCreatorType(creatorType) {
  if (creatorType === "publisher") {
    return [...BASE_CSV_HEADERS, "artist"];
  }
  return [...BASE_CSV_HEADERS, "publisher"];
}
export {
  BASE_CSV_HEADERS,
  MAX_BOOKS_CREATED_PER_DAY,
  MAX_BOOKS_FOR_BULK_UPLOAD,
  MAX_IMAGES_PER_BOOK,
  MAX_IMAGE_SIZE_BYTES,
  MAX_IMAGE_UPLOADS_PER_HOUR,
  MAX_IMPORTS_PER_HOUR,
  MAX_IMPORT_FILE_BYTES,
  MAX_IMPORT_ROWS,
  MAX_TOTAL_UPLOAD_SIZE_BYTES,
  getCsvHeadersForCreatorType
};
