import { csvBookRowSchema, type ValidatedCsvBookRow } from "./schema";
import type { CsvBookRow } from "./schema";

export type RowValidationResult = {
  rowNumber: number;
  row: Partial<CsvBookRow>;
  valid: boolean;
  errors: string[];
  validated?: ValidatedCsvBookRow;
};

export function validateImportRows(
  rows: Array<{ row: Partial<CsvBookRow>; rowNumber: number }>,
  creatorType: "artist" | "publisher",
): RowValidationResult[] {
  return rows.map(({ row, rowNumber }) => {
    const errors: string[] = [];

    if (creatorType === "publisher" && !row.artist?.trim()) {
      errors.push("Artist is required for publisher imports");
    }

    const parsed = csvBookRowSchema.safeParse({
      ...row,
      availability_status: row.availability_status ?? "available",
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
      validated: { ...parsed.data, rowNumber },
    };
  });
}

export function getValidRows(
  results: RowValidationResult[],
): ValidatedCsvBookRow[] {
  return results
    .filter(
      (r): r is RowValidationResult & { validated: ValidatedCsvBookRow } =>
        r.valid && !!r.validated,
    )
    .map((r) => r.validated);
}
