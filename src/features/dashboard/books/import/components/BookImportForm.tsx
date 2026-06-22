import Button from "../../../../../components/app/Button";
import Link from "../../../../../components/app/Link";
import SectionTitle from "../../../../../components/app/SectionTitle";
import FileUploadInput from "../../../../../components/forms/FileUpload";
import { MAX_IMPORT_ROWS } from "../constants";
import type { RowValidationResult } from "../validateRows";
import BookImportPreviewTable from "./BookImportPreviewTable";
import type { ValidatedCsvBookRow } from "../schema";

type BookImportFormProps = {
  creatorType: "artist" | "publisher";
  previewResults?: RowValidationResult[];
  validRows?: ValidatedCsvBookRow[];
};

const BookImportForm = ({
  creatorType,
  previewResults,
  validRows,
}: BookImportFormProps) => {
  const hasPreview = !!previewResults;
  const validCount = previewResults?.filter((r) => r.valid).length ?? 0;
  const invalidCount = previewResults?.filter((r) => !r.valid).length ?? 0;

  return (
    <div class="flex flex-col gap-8">
      <div class="space-y-4">
        <SectionTitle>Upload CSV</SectionTitle>
        <p class="text-on-surface-weak">
          Import up to {MAX_IMPORT_ROWS} books at once. Books are created as
          drafts — upload covers from the books table to publish.
        </p>
        <ul class="list-disc pl-5 text-sm text-on-surface-weak space-y-1">
          <li>
            <strong>title</strong> (required) — at least 3 characters
          </li>
          <li>
            <strong>description</strong>, <strong>release_date</strong>{" "}
            (YYYY-MM-DD), <strong>tags</strong>, <strong>purchase_link</strong>,{" "}
            <strong>availability_status</strong> (available / sold_out /
            unavailable)
          </li>
          {creatorType === "publisher" ? (
            <li>
              <strong>artist</strong> (required) — artist display name per row
            </li>
          ) : (
            <li>
              <strong>publisher</strong> (optional) — leave blank for
              self-published
            </li>
          )}
        </ul>
        <Link href="/dashboard/books/import/template">
          <Button variant="outline" color="inverse">
            Download template CSV
          </Button>
        </Link>
      </div>

      {!hasPreview && (
        <form
          method="post"
          action="/dashboard/books/import"
          enctype="multipart/form-data"
        >
          <input type="hidden" name="intent" value="preview" />
          <div class="space-y-4">
            <FileUploadInput
              label="Choose CSV file"
              name="csv"
              accept=".csv,text/csv"
              required
              isVisible
            />
            <Button variant="solid" color="primary" type="submit">
              Preview import
            </Button>
          </div>
        </form>
      )}

      {hasPreview && (
        <div id="import-preview" class="space-y-6">
          <div class="flex flex-wrap gap-4 text-sm">
            <span class="text-success">
              {validCount} valid row{validCount === 1 ? "" : "s"}
            </span>
            {invalidCount > 0 && (
              <span class="text-danger">
                {invalidCount} row{invalidCount === 1 ? "" : "s"} with errors
              </span>
            )}
          </div>

          <BookImportPreviewTable results={previewResults!} />

          <div class="flex gap-4">
            {validRows && validRows.length > 0 && (
              <form method="post" action="/dashboard/books/import">
                <input type="hidden" name="intent" value="confirm" />
                <input
                  type="hidden"
                  name="rows_json"
                  value={JSON.stringify(validRows)}
                />
                <Button variant="solid" color="primary" type="submit">
                  Confirm import ({validRows.length} book
                  {validRows.length === 1 ? "" : "s"})
                </Button>
              </form>
            )}
            <Link href="/dashboard/books/import">
              <Button variant="outline" color="inverse">
                Upload a different file
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookImportForm;
