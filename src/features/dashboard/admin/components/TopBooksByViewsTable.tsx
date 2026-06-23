import Link from "../../../../components/app/Link";
import SectionTitle from "../../../../components/app/SectionTitle";
import Table from "../../../../components/app/Table";
import { formatClickRate } from "../../../book-analytics/funnel";
import WindowTable from "./WindowTable";
import ListNavigation from "../../../app/components/ListNavigation";

type TopBookByViewsRow = {
  bookId: string;
  title: string;
  slug: string;
  coverUrl: string | null;
  viewCount: number;
  artistName: string | null;
  publisherName: string | null;
};

type Props = {
  currentPath: string;
  pageParam: string;
  books: TopBookByViewsRow[];
  totalPages: number;
  page: number;
  targetId?: string;
  clickCounts: Map<string, number>;
};

const TopBooksByViewsTable = async ({
  currentPath,
  pageParam,
  books,
  totalPages,
  page,
  targetId = "analytics-top-books-by-views",
  clickCounts,
}: Props) => {
  return (
    <div>
      <SectionTitle>Top books by views</SectionTitle>
      <WindowTable>
        <Table>
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
          <Table.Body id={targetId} xMerge="append">
            {books.length === 0 ? (
              <tr>
                <Table.BodyRow>No book views yet.</Table.BodyRow>
              </tr>
            ) : (
              books.map((row) => {
                const clicks = clickCounts.get(row.bookId) ?? 0;
                const clickRate = formatClickRate(row.viewCount, clicks) ?? "—";

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
        <ListNavigation
          isInfiniteScroll
          currentPath={currentPath}
          page={page}
          totalPages={totalPages}
          targetId={targetId}
          pageParam={pageParam}
          navId={`pagination-top-books-by-views-table`}
        />
      </WindowTable>
    </div>
  );
};

export default TopBooksByViewsTable;
