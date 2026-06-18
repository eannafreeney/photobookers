import Link from "../../../../../components/app/Link";
import SectionTitle from "../../../../../components/app/SectionTitle";
import Table from "../../../../../components/app/Table";
import { formatClickRate } from "../../../../book-analytics/funnel";
import { getTopBooksByViews } from "../../../../book-views/services";
import { findPurchaseClickCounts } from "../../../../purchase-clicks/services";

const TopBooksByViewsTable = async () => {
  const [error, rows] = await getTopBooksByViews(25);
  if (error) return <div>{error.reason}</div>;

  const clickCounts = await findPurchaseClickCounts(
    rows.map((row) => row.bookId),
  );

  return (
    <div class="flex flex-col gap-4">
      <SectionTitle>Top books by views</SectionTitle>
      <Table id="analytics-top-books-by-views">
        <Table.Head>
          <tr>
            <Table.HeadRow>Cover</Table.HeadRow>
            <Table.HeadRow>Title</Table.HeadRow>
            <Table.HeadRow>Artist</Table.HeadRow>
            <Table.HeadRow>Publisher</Table.HeadRow>
            <Table.HeadRow>Views</Table.HeadRow>
            <Table.HeadRow>Outbound clicks</Table.HeadRow>
            <Table.HeadRow>Click rate</Table.HeadRow>
          </tr>
        </Table.Head>
        <Table.Body>
          {rows.length === 0 ? (
            <tr>
              <Table.BodyRow>No book views yet.</Table.BodyRow>
            </tr>
          ) : (
            rows.map((row) => {
              const clicks = clickCounts.get(row.bookId) ?? 0;
              const clickRate =
                formatClickRate(row.viewCount, clicks) ?? "—";

              return (
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
                  <Table.BodyRow>{row.viewCount}</Table.BodyRow>
                  <Table.BodyRow>{clicks}</Table.BodyRow>
                  <Table.BodyRow>{clickRate}</Table.BodyRow>
                </tr>
              );
            })
          )}
        </Table.Body>
      </Table>
    </div>
  );
};

export default TopBooksByViewsTable;
