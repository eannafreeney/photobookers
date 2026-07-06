import { csvBookRowSchema } from "./schema.js";
function validateImportRows(rows, creatorType) {
  return rows.map(({ row, rowNumber }) => {
    const errors = [];
    if (creatorType === "publisher" && !row.artist?.trim()) {
      errors.push("Artist is required for publisher imports");
    }
    const parsed = csvBookRowSchema.safeParse({
      ...row,
      availability_status: row.availability_status ?? "available"
    });
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        errors.push(issue.message);
      }
      return { rowNumber, row, valid: false, errors };
    }
    if (errors.length > 0) {
      return { rowNumber, row, valid: false, errors };
    }
    return {
      rowNumber,
      row,
      valid: true,
      errors: [],
      validated: { ...parsed.data, rowNumber }
    };
  });
}
function getValidRows(results) {
  return results.filter(
    (r) => r.valid && !!r.validated
  ).map((r) => r.validated);
}
export {
  getValidRows,
  validateImportRows
};
