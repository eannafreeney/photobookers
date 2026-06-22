import Table from "../../../../../components/app/Table";
import type { RowValidationResult } from "../validateRows";

type Props = {
  results: RowValidationResult[];
};

const BookImportPreviewTable = ({ results }: Props) => {
  return (
    <Table id="import-preview-table">
      <Table.Head>
        <tr>
          <Table.HeadRow>Row</Table.HeadRow>
          <Table.HeadRow>Title</Table.HeadRow>
          <Table.HeadRow>Artist</Table.HeadRow>
          <Table.HeadRow>Publisher</Table.HeadRow>
          <Table.HeadRow>Release</Table.HeadRow>
          <Table.HeadRow>Status</Table.HeadRow>
          <Table.HeadRow>Details</Table.HeadRow>
        </tr>
      </Table.Head>
      <Table.Body>
        {results.map((result) => (
          <tr key={result.rowNumber}>
            <Table.BodyRow>{result.rowNumber}</Table.BodyRow>
            <Table.BodyRow>{result.row.title ?? "—"}</Table.BodyRow>
            <Table.BodyRow>{result.row.artist ?? "—"}</Table.BodyRow>
            <Table.BodyRow>{result.row.publisher ?? "—"}</Table.BodyRow>
            <Table.BodyRow>{result.row.release_date ?? "—"}</Table.BodyRow>
            <Table.BodyRow>
              <span class={result.valid ? "text-success" : "text-danger"}>
                {result.valid ? "OK" : "Error"}
              </span>
            </Table.BodyRow>
            <Table.BodyRow>
              {result.errors.length > 0 ? (
                <span class="text-danger text-sm">{result.errors.join("; ")}</span>
              ) : (
                <span class="text-on-surface-weak text-sm">Ready to import</span>
              )}
            </Table.BodyRow>
          </tr>
        ))}
      </Table.Body>
    </Table>
  );
};

export default BookImportPreviewTable;
