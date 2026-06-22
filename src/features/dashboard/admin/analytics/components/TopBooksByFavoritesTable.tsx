import Link from "../../../../../components/app/Link";
import SectionTitle from "../../../../../components/app/SectionTitle";
import Table from "../../../../../components/app/Table";
import ListNavigation from "../../../../app/components/ListNavigation";
import type { AnalyticsDateRange } from "../../../../book-analytics/dateRange";
import { getTopBooksByFavorites } from "../../../../book-analytics/engagement";
import WindowTable from "./WindowTable";

type Props = {
  dateRange: AnalyticsDateRange | null;
  currentPath: string;
  currentPage: number;
  pageParam: string;
};

const TopBooksByFavoritesTable = async ({
  dateRange,
  currentPath,
  currentPage,
  pageParam,
}: Props) => {
  const [error, result] = await getTopBooksByFavorites(dateRange, currentPage);
  if (error) return <div>{error.reason}</div>;

  const targetId = "analytics-top-books-by-favorites";
  const { books, totalPages, page } = result;

  return (
    <>
      <SectionTitle>Top books by favorites</SectionTitle>
      <WindowTable>
        <Table>
          <Table.Head>
            <tr>
              <Table.HeadRow>Cover</Table.HeadRow>
              <Table.HeadRow>Title</Table.HeadRow>
              <Table.HeadRow>Artist</Table.HeadRow>
              <Table.HeadRow>Publisher</Table.HeadRow>
              <Table.HeadRow>Favorites</Table.HeadRow>
            </tr>
          </Table.Head>
          <Table.Body id={targetId} xMerge="append">
            {books.length === 0 ? (
              <tr>
                <Table.BodyRow>No favorites yet.</Table.BodyRow>
              </tr>
            ) : (
              books.map((row) => (
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
                  <Table.BodyRow>{row.favoriteCount}</Table.BodyRow>
                </tr>
              ))
            )}
          </Table.Body>
        </Table>
        <ListNavigation
          isInfiniteScroll
          currentPath={currentPath}
          page={page}
          totalPages={totalPages}
          targetId={targetId}
          pageParam={pageParam}
          navId="pagination-top-books-by-favorites-table"
        />
      </WindowTable>
    </>
  );
};

export default TopBooksByFavoritesTable;
