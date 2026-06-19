import Link from "../../../../../components/app/Link";
import SectionTitle from "../../../../../components/app/SectionTitle";
import Table from "../../../../../components/app/Table";
import type { AnalyticsDateRange } from "../../../../book-analytics/dateRange";
import { getTopBooksByClicks } from "../../../../purchase-clicks/services";

type Props = {
  dateRange: AnalyticsDateRange | null;
};

const TopBooksTable = async ({ dateRange }: Props) => {
  const [error, rows] = await getTopBooksByClicks(25, dateRange);
  if (error) return <div>{error.reason}</div>;

  return (
    <div class="flex flex-col gap-4">
      <SectionTitle>Top books by outbound clicks</SectionTitle>
      <Table id="analytics-top-books">
        <Table.Head>
          <tr>
            <Table.HeadRow>Cover</Table.HeadRow>
            <Table.HeadRow>Title</Table.HeadRow>
            <Table.HeadRow>Artist</Table.HeadRow>
            <Table.HeadRow>Publisher</Table.HeadRow>
            <Table.HeadRow>Outbound clicks</Table.HeadRow>
          </tr>
        </Table.Head>
        <Table.Body>
          {rows.length === 0 ? (
            <tr>
              <Table.BodyRow>No outbound clicks yet.</Table.BodyRow>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.bookId}>
                <Table.BodyRow>
                  {row.coverUrl ? (
                    <img
                      src={row.coverUrl}
                      alt={row.title}
                      class="h-12 w-auto"
                    />
                  ) : null}
                </Table.BodyRow>
                <Table.BodyRow>
                  <Link href={`/books/${row.slug}`} target="_blank">
                    {row.title}
                  </Link>
                </Table.BodyRow>
                <Table.BodyRow>{row.artistName ?? ""}</Table.BodyRow>
                <Table.BodyRow>{row.publisherName ?? ""}</Table.BodyRow>
                <Table.BodyRow>{row.clickCount}</Table.BodyRow>
              </tr>
            ))
          )}
        </Table.Body>
      </Table>
    </div>
  );
};

export default TopBooksTable;
