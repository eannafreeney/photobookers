import { getCsvHeadersForCreatorType } from "./constants.js";
function escapeCsvValue(value) {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
const EXAMPLE_VALUES = {
  title: "Example Book Title",
  description: "A short description of the book",
  release_date: "2024-06-01",
  tags: "photography, documentary",
  purchase_link: "https://example.com/buy",
  availability_status: "available",
  artist: "Jane Artist",
  publisher: "Example Press"
};
function buildImportTemplateCsv(creatorType) {
  const headers = getCsvHeadersForCreatorType(creatorType);
  const lines = [
    headers.join(","),
    headers.map((h) => escapeCsvValue(EXAMPLE_VALUES[h])).join(",")
  ];
  return lines.join("\n");
}
export {
  buildImportTemplateCsv
};
