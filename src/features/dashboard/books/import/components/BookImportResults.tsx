import Link from "../../../../../components/app/Link";
import SectionTitle from "../../../../../components/app/SectionTitle";
import Button from "../../../../../components/app/Button";
import type { ImportBookResult } from "../importBooks";

type Props = {
  results: ImportBookResult[];
};

const BookImportResults = ({ results }: Props) => {
  const created = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);
  const createdBookIds = created
    .map((r) => r.bookId)
    .filter(Boolean) as string[];

  return (
    <div class="space-y-6">
      <SectionTitle>Import complete</SectionTitle>
      <p>
        Created {created.length} book{created.length === 1 ? "" : "s"}
        {failed.length > 0 ? ` (${failed.length} failed)` : ""}.
      </p>

      {createdBookIds.length > 0 && (
        <div class="flex gap-4">
          <Link
            href={`/dashboard/books/import/images?books=${createdBookIds.join(",")}`}
          >
            <Button variant="solid" color="primary">
              Upload images for these books
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" color="inverse">
              Skip and upload later
            </Button>
          </Link>
        </div>
      )}

      {created.length > 0 && (
        <ul class="list-disc pl-5 space-y-1">
          {created.map((r) => (
            <li key={r.rowNumber}>
              {r.bookId ? (
                <Link href={`/dashboard/books/${r.bookId}`}>{r.title}</Link>
              ) : (
                r.title
              )}
            </li>
          ))}
        </ul>
      )}

      {failed.length > 0 && (
        <div class="space-y-2">
          <p class="text-danger font-medium">Failed rows</p>
          <ul class="list-disc pl-5 space-y-1 text-sm text-danger">
            {failed.map((r) => (
              <li key={r.rowNumber}>
                Row {r.rowNumber}: {r.title} — {r.error}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Link href="/dashboard">
        <span class="underline">Back to books overview</span>
      </Link>
    </div>
  );
};

export default BookImportResults;
